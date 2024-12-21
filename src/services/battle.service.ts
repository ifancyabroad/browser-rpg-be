import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { Session, SessionData } from "express-session";
import { BattleResult, BattleState, DamageType, State, Status, Zone } from "@common/utils/enums/index";
import { GameData } from "@common/utils/game/GameData";
import { Game } from "@common/utils/game/Game";
import { IBattleInput, ITreasureInput } from "@common/types/battle";
import BattleModel from "@models/battle.model";
import HeroModel, { HeroArchive } from "@models/hero.model";
import EnemyModel from "@models/enemy.model";
import UserModel from "@models/user.model";
import { BATTLE_MULTIPLIER_INCREMENT, FINAL_LEVEL, MAX_CHARACTER_LEVEL, REWARD_GOLD_MULTIPLIER } from "@common/utils";
import { IHero } from "@common/types/hero";
import socket from "socket";

async function getFallenHeroData(battleZone: Zone, battleLevel: number) {
	const isBoss = Game.getIsBoss(battleLevel);
	const enemyLevel = Game.getEnemyLevel(battleLevel);
	const level = enemyLevel > MAX_CHARACTER_LEVEL ? MAX_CHARACTER_LEVEL : enemyLevel;
	const kills = battleLevel <= FINAL_LEVEL ? { $lt: FINAL_LEVEL } : { $gte: FINAL_LEVEL };
	const heroes = await HeroArchive.aggregate<IHero>([
		{ $match: { status: Status.Dead, level, kills } },
		{ $sample: { size: 1 } },
	]);
	const hero = heroes[0];

	if (!hero) {
		return null;
	}

	const user = await UserModel.findById(hero.user);
	const username = user?.username ?? "Unknown";

	const classData = GameData.getCharacterClassById(hero.characterClassID);

	return {
		name: `Fallen ${classData.name} ${hero.name}`,
		image: classData.fallenImage,
		level: hero.level,
		challenge: 15,
		zone: battleZone,
		boss: isBoss,
		hero: true,
		username,
		skillIDs: hero.skillIDs,
		equipmentIDs: hero.equipmentIDs,
		tactics: classData.tactics,
		baseStats: hero.baseStats,
		baseResistances: hero.baseResistances,
		baseHitPoints: hero.baseMaxHitPoints,
		baseMaxHitPoints: hero.baseMaxHitPoints,
		naturalArmourClass: 0,
		naturalMinDamage: 1,
		naturalMaxDamage: 4,
		naturalDamageType: DamageType.Crushing,
	};
}

function getMonsterData(battleZone: Zone, battleLevel: number) {
	const isBoss = Game.getIsBoss(battleLevel);
	const enemyLevel = Game.getEnemyLevel(battleLevel);
	const hitPoints = Game.getHitPoints(enemyLevel);
	const enemyData = GameData.getEnemy(battleZone, isBoss);
	const skills = enemyData.skills.map((id) => ({
		id,
		remaining: GameData.getSkillById(id).maxUses,
	}));
	const equipment = "equipment" in enemyData ? enemyData.equipment : undefined;
	const gameLevel = Game.getGameLevel(battleLevel);
	let { stats, resistances } = enemyData;

	if (gameLevel > 0) {
		stats = Game.getEnemyStats(gameLevel, enemyData.stats);
		resistances = Game.getEnemyResistances(gameLevel, enemyData.resistances);
	}

	return {
		name: enemyData.name,
		image: enemyData.portrait,
		level: enemyLevel,
		challenge: enemyData.challenge,
		zone: enemyData.zone,
		boss: isBoss,
		hero: false,
		skillIDs: skills,
		equipmentIDs: equipment,
		tactics: enemyData.tactics,
		baseStats: stats,
		baseResistances: resistances,
		baseHitPoints: hitPoints,
		baseMaxHitPoints: hitPoints,
		naturalArmourClass: enemyData.naturalArmourClass,
		naturalMinDamage: enemyData.naturalMinDamage,
		naturalMaxDamage: enemyData.naturalMaxDamage,
		naturalDamageType: enemyData.naturalDamageType,
	};
}

async function getEnemyData(battleZone: Zone, battleLevel: number) {
	const isBoss = Game.getIsBoss(battleLevel);

	if (isBoss) {
		return getMonsterData(battleZone, battleLevel);
	}

	const roll = Game.d20;
	if (roll > 1) {
		return getMonsterData(battleZone, battleLevel);
	}

	const hero = await getFallenHeroData(battleZone, battleLevel);
	if (hero) {
		return hero;
	}

	return getMonsterData(battleZone, battleLevel);
}

export async function startBattle(session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character found");
		}

		const battleRecord = await BattleModel.findOne({
			hero: characterRecord.id,
		});
		if (battleRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "Battle already exists");
		}

		const level = characterRecord.maxBattleLevel + 1;
		const zone = Game.getZone(level);
		const enemyData = await getEnemyData(zone, level);

		const enemy = await EnemyModel.create(enemyData);

		const battle = await BattleModel.create({
			user: user.id,
			hero: characterRecord.id,
			enemy: enemy.id,
			zone,
			level,
		});

		characterRecord.state = State.Battle;
		const character = await characterRecord.save();

		return {
			battle: battle.toJSON(),
			character: character.toJSON(),
		};
	} catch (error) {
		console.error(`Error startBattle: ${error.message}`);
		throw error;
	}
}

export async function nextBattle(session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Battle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character found");
		}

		const battleRecord = await BattleModel.findOne({
			hero: characterRecord.id,
			state: BattleState.Active,
			result: BattleResult.Won,
		});
		if (!battleRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No active battle found");
		}

		const level = battleRecord.level + 1;
		const multiplier = battleRecord.multiplier + BATTLE_MULTIPLIER_INCREMENT;
		const zone = Game.getZone(level);
		const enemyData = await getEnemyData(zone, level);

		const enemy = await EnemyModel.create(enemyData);

		const battle = await BattleModel.create({
			user: user.id,
			hero: characterRecord.id,
			enemy: enemy.id,
			zone,
			level,
			multiplier,
		});

		await Promise.all([EnemyModel.findByIdAndDelete(battleRecord.enemy), battleRecord.deleteOne()]);

		return {
			battle: battle.toJSON(),
			character: characterRecord.toJSON(),
		};
	} catch (error) {
		console.error(`Error nextBattle: ${error.message}`);
		throw error;
	}
}

export async function getBattle(session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Battle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character found");
		}

		const battleRecord = await BattleModel.findOne({
			hero: characterRecord.id,
			state: BattleState.Active,
		});
		if (!battleRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No active battle found");
		}

		return {
			battle: battleRecord.toJSON(),
			character: characterRecord.toJSON(),
		};
	} catch (error) {
		console.error(`Error getBattle: ${error.message}`);
		throw error;
	}
}

export async function returnToTown(session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Battle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character found");
		}

		const battleRecord = await BattleModel.findOne({
			hero: characterRecord.id,
			state: BattleState.Active,
			result: BattleResult.Won,
		});
		if (!battleRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No active battle found");
		}

		battleRecord.state = BattleState.Complete;
		characterRecord.state = State.Idle;

		const [character, battle] = await Promise.all([characterRecord.save(), battleRecord.save()]);

		await Promise.all([EnemyModel.findByIdAndDelete(battle.enemy), battle.deleteOne()]);

		return {
			battle: battle.toJSON(),
			character: character.toJSON(),
		};
	} catch (error) {
		console.error(`Error returnToTown: ${error.message}`);
		throw error;
	}
}

export async function action(skill: IBattleInput, session: Session & Partial<SessionData>) {
	const { id } = skill;
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Battle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character found");
		}

		const battleRecord = await BattleModel.findOne({
			hero: characterRecord.id,
			state: BattleState.Active,
		});
		if (!battleRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No battle found");
		}

		const enemyRecord = await EnemyModel.findById(battleRecord.enemy);

		const turn = battleRecord.handleTurn(
			{
				self: characterRecord,
				enemy: enemyRecord,
				skill: id,
			},
			{
				self: enemyRecord,
				enemy: characterRecord,
				skill: enemyRecord.getSkill(characterRecord).id,
			},
		);

		battleRecord.turns.push(turn);

		const connection = socket.connection();

		if (!characterRecord.alive) {
			battleRecord.result = BattleResult.Lost;
			characterRecord.battleLost(enemyRecord.name);
			connection.emit("message", {
				color: "error.main",
				message: `${characterRecord.name} the level ${characterRecord.level} ${characterRecord.characterClass.name} has been slain by ${enemyRecord.nameWithDeterminer}`,
			});
		}

		if (characterRecord.alive && !enemyRecord.alive) {
			battleRecord.handleReward(characterRecord, enemyRecord);
			battleRecord.handleTreasure(characterRecord, enemyRecord);
			battleRecord.result = BattleResult.Won;
			characterRecord.battleWon(battleRecord);

			connection.emit("message", {
				color: "text.primary",
				message: `${characterRecord.name} the ${characterRecord.characterClass.name} has defeated ${enemyRecord.nameWithDeterminer}`,
			});

			if (battleRecord.level === FINAL_LEVEL) {
				connection.emit("message", {
					color: "success.main",
					message: `${characterRecord.name} the ${characterRecord.characterClass.name} has defeated the defeated the monsters and saved the townsfolk. Congratulations!`,
				});
			}
		}

		const enemy = await enemyRecord.save();
		const [character, battle] = await Promise.all([characterRecord.save(), battleRecord.save()]);

		if (!character.alive) {
			await Promise.all([battle.deleteOne(), enemy.deleteOne(), character.deleteOne()]);

			await HeroArchive.create(
				character.toJSON({
					virtuals: false,
					depopulate: true,
					versionKey: false,
					transform: (doc, ret) => {
						delete ret.__t;
						return ret;
					},
				}),
			);
		}

		return {
			battle: battle.toJSON(),
			character: character.toJSON(),
		};
	} catch (error) {
		console.error(`Error action: ${error.message}`);
		throw error;
	}
}

export async function takeTreasure(item: ITreasureInput, session: Session & Partial<SessionData>) {
	const { id, slot } = item;
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Battle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to proceed");
		}

		const battleRecord = await BattleModel.findOne({
			hero: characterRecord.id,
			state: BattleState.Active,
			result: BattleResult.Won,
		});
		if (!battleRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No active battle found");
		}

		if (id && !battleRecord.treasureItemIDs.includes(id)) {
			throw createHttpError(httpStatus.BAD_REQUEST, "Item not found in treasure");
		}

		if (id) {
			characterRecord.checkItem(id, slot);
			characterRecord.equipItem(id, slot);
		} else {
			const goldReward = REWARD_GOLD_MULTIPLIER * battleRecord.level;
			characterRecord.gold += goldReward;
		}

		battleRecord.set("treasureItemIDs", []);

		const [character, battle] = await Promise.all([characterRecord.save(), battleRecord.save()]);

		return {
			battle: battle.toJSON(),
			character: character.toJSON(),
		};
	} catch (error) {
		console.error(`Error takeTreasure: ${error.message}`);
		throw error;
	}
}
