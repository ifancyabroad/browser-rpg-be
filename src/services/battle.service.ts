import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { Session, SessionData } from "express-session";
import { BattleResult, BattleState, DamageType, State, Status, Zone } from "@common/utils/enums/index";
import { GameData } from "@common/utils/game/GameData";
import { Game } from "@common/utils/game/Game";
import { IBattleInput, ITreasureInput, TBattleDocument } from "@common/types/battle";
import BattleModel from "@models/battle.model";
import HeroModel, { HeroArchive } from "@models/hero.model";
import EnemyModel from "@models/enemy.model";
import UserModel from "@models/user.model";
import {
	BATTLE_MULTIPLIER_INCREMENT,
	CACHE_ENABLED,
	FINAL_LEVEL,
	MAX_CHARACTER_LEVEL,
	REWARD_GOLD_MULTIPLIER,
} from "@common/utils";
import { IHero, THeroDocument } from "@common/types/hero";
import socket from "socket";
import cache from "cache";
import { TEnemyDocument } from "@common/types/enemy";

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

		if (CACHE_ENABLED) {
			cache.set(`character_${user.id}`, character.toObject());
			cache.set(`battle_${user.id}`, battle.toObject());
			cache.set(`enemy_${user.id}`, enemy.toObject());
		}

		const connection = socket.connection();

		connection?.emit("message", {
			color: "text.primary",
			username: user.username,
			message: `${character.name} the ${character.characterClass.name} has left town to enter the ${zone}`,
		});

		return {
			// Backward compatibility
			battle: {
				...battle.toJSON(),
				enemy: enemy.toJSON(),
			},
			character: character.toJSON(),
			enemy: enemy.toJSON(),
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

		if (CACHE_ENABLED) {
			cache.set(`character_${user.id}`, characterRecord.toObject());
			cache.set(`battle_${user.id}`, battle.toObject());
			cache.set(`enemy_${user.id}`, enemy.toObject());
		}

		return {
			// Backward compatibility
			battle: {
				...battle.toJSON(),
				enemy: enemy.toJSON(),
			},
			character: characterRecord.toJSON(),
			enemy: enemy.toJSON(),
		};
	} catch (error) {
		console.error(`Error nextBattle: ${error.message}`);
		throw error;
	}
}

async function getActiveBattleData(userId: string) {
	let characterRecord: THeroDocument;
	let battleRecord: TBattleDocument;
	let enemyRecord: TEnemyDocument;

	if (CACHE_ENABLED) {
		characterRecord = cache.get<THeroDocument>(`character_${userId}`);
		battleRecord = cache.get<TBattleDocument>(`battle_${userId}`);
		enemyRecord = cache.get<TEnemyDocument>(`enemy_${userId}`);
	}

	if (!characterRecord) {
		characterRecord = await HeroModel.findOne({
			user: userId,
			status: Status.Alive,
			state: State.Battle,
		});
	} else {
		characterRecord = HeroModel.hydrate(characterRecord);
	}

	if (!characterRecord) {
		throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character found");
	}

	if (!battleRecord) {
		battleRecord = await BattleModel.findOne({
			hero: characterRecord.id,
			state: BattleState.Active,
		});
	} else {
		battleRecord = BattleModel.hydrate(battleRecord);
	}

	if (!battleRecord) {
		throw createHttpError(httpStatus.BAD_REQUEST, "No active battle found");
	}

	if (!enemyRecord) {
		enemyRecord = await EnemyModel.findById(battleRecord.enemy);
	} else {
		enemyRecord = EnemyModel.hydrate(enemyRecord);
	}

	if (!enemyRecord) {
		throw createHttpError(httpStatus.BAD_REQUEST, "No enemy found");
	}

	return {
		battleRecord,
		characterRecord,
		enemyRecord,
	};
}

export async function getBattle(session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const { battleRecord, characterRecord, enemyRecord } = await getActiveBattleData(user.id);

		if (CACHE_ENABLED) {
			cache.set(`character_${user.id}`, characterRecord.toObject());
			cache.set(`battle_${user.id}`, battleRecord.toObject());
			cache.set(`enemy_${user.id}`, enemyRecord.toObject());
		}

		return {
			// Backward compatibility
			battle: {
				...battleRecord.toJSON(),
				enemy: enemyRecord.toJSON(),
			},
			character: characterRecord.toJSON(),
			enemy: enemyRecord.toJSON(),
		};
	} catch (error) {
		console.error(`Error getBattle: ${error.message}`);
		throw error;
	}
}

export async function action(skill: IBattleInput, session: Session & Partial<SessionData>) {
	const { id } = skill;
	const { user } = session;
	try {
		const { battleRecord, characterRecord, enemyRecord } = await getActiveBattleData(user.id);

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

		if (CACHE_ENABLED) {
			cache.set(`character_${user.id}`, characterRecord.toObject());
			cache.set(`battle_${user.id}`, battleRecord.toObject());
			cache.set(`enemy_${user.id}`, enemyRecord.toObject());
		}

		const connection = socket.connection();

		if (!characterRecord.alive) {
			battleRecord.result = BattleResult.Lost;
			characterRecord.battleLost(enemyRecord.name);

			connection?.emit("message", {
				color: "error.main",
				username: user.username,
				message: `${characterRecord.name} the ${characterRecord.characterClass.name} has been slain by ${enemyRecord.nameWithDeterminer} (${characterRecord.kills} kills)`,
			});

			const characterData = characterRecord.toJSON({
				virtuals: false,
				depopulate: true,
				versionKey: false,
				transform: (doc, ret) => {
					delete ret.__t;
					return ret;
				},
			});

			await HeroArchive.create([characterData], {
				timestamps: false,
			});

			await Promise.all([
				HeroModel.deleteOne({ _id: characterRecord.id }),
				BattleModel.deleteOne({ _id: battleRecord.id }),
				EnemyModel.deleteOne({ _id: enemyRecord.id }),
			]);

			cache.del(`character_${user.id}`);
			cache.del(`battle_${user.id}`);
			cache.del(`enemy_${user.id}`);
		}

		if (characterRecord.alive && !enemyRecord.alive) {
			battleRecord.handleReward(characterRecord, enemyRecord);
			battleRecord.handleTreasure(characterRecord, enemyRecord);
			battleRecord.result = BattleResult.Won;
			characterRecord.battleWon(battleRecord);

			connection?.emit("message", {
				color: "text.primary",
				username: user.username,
				message: `${characterRecord.name} the ${characterRecord.characterClass.name} has defeated ${enemyRecord.nameWithDeterminer} (${characterRecord.kills} kills)`,
			});

			if (battleRecord.level === FINAL_LEVEL) {
				connection?.emit("message", {
					color: "success.main",
					username: user.username,
					message: `${characterRecord.name} the ${characterRecord.characterClass.name} has defeated the monsters and saved the townsfolk. Congratulations!`,
				});
			}

			await Promise.all([
				HeroModel.updateOne({ _id: characterRecord.id }, { $set: characterRecord }).exec(),
				BattleModel.updateOne({ _id: battleRecord.id }, { $set: battleRecord }).exec(),
				EnemyModel.updateOne({ _id: enemyRecord.id }, { $set: enemyRecord }).exec(),
			]);

			cache.del(`character_${user.id}`);
			cache.del(`battle_${user.id}`);
			cache.del(`enemy_${user.id}`);
		}

		return {
			// Backward compatibility
			battle: {
				...battleRecord.toJSON(),
				enemy: enemyRecord.toJSON(),
			},
			character: characterRecord.toJSON(),
			enemy: enemyRecord.toJSON(),
		};
	} catch (error) {
		console.error(`Error action: ${error.message}`);
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

		const enemy = await EnemyModel.findById(battleRecord.enemy);
		if (!enemy) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No enemy found");
		}

		battleRecord.state = BattleState.Complete;
		characterRecord.state = State.Idle;

		const [character, battle] = await Promise.all([characterRecord.save(), battleRecord.save()]);

		await Promise.all([EnemyModel.findByIdAndDelete(battle.enemy), battle.deleteOne()]);

		const connection = socket.connection();

		connection?.emit("message", {
			color: "text.primary",
			username: user.username,
			message: `${character.name} the ${character.characterClass.name} has returned to town`,
		});

		return {
			// Backward compatibility
			battle: {
				...battle.toJSON(),
				enemy: enemy.toJSON(),
			},
			character: character.toJSON(),
			enemy: enemy.toJSON(),
		};
	} catch (error) {
		console.error(`Error returnToTown: ${error.message}`);
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

		const enemyRecord = await EnemyModel.findById(battleRecord.enemy);
		if (!enemyRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No enemy found");
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
			// Backward compatibility
			battle: {
				...battle.toJSON(),
				enemy: enemyRecord.toJSON(),
			},
			character: character.toJSON(),
			enemy: enemyRecord.toJSON(),
		};
	} catch (error) {
		console.error(`Error takeTreasure: ${error.message}`);
		throw error;
	}
}
