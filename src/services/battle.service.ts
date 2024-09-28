import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { Session, SessionData } from "express-session";
import { BattleResult, BattleState, State, Status, Zone } from "@common/utils/enums/index";
import { GameData } from "@common/utils/game/GameData";
import { Game } from "@common/utils/game/Game";
import { IBattleInput, ITreasureInput } from "@common/types/battle";
import BattleModel from "@models/battle.model";
import HeroModel from "@models/hero.model";
import EnemyModel from "@models/enemy.model";
import { REWARD_GOLD_MULTIPLIER } from "@common/utils";

function getEnemyData(battleLevel: number) {
	const rating = Game.getChallengeRating(battleLevel);
	const isBoss = Game.getIsBoss(battleLevel);
	const level = Game.getEnemyLevel(battleLevel);
	const hitPoints = Game.getHitPoints(level);
	const enemyData = GameData.getEnemy(rating, isBoss);
	const skills = enemyData.skills.map((id) => ({
		id,
		remaining: GameData.getSkillById(id).maxUses,
	}));
	const equipment = "equipment" in enemyData ? enemyData.equipment : undefined;

	return {
		name: enemyData.name,
		image: enemyData.portrait,
		level,
		challenge: enemyData.challenge,
		boss: isBoss,
		skillIDs: skills,
		equipmentIDs: equipment,
		baseStats: enemyData.stats,
		baseResistances: enemyData.resistances,
		baseHitPoints: hitPoints,
		baseMaxHitPoints: hitPoints,
		naturalArmourClass: enemyData.naturalArmourClass,
		naturalMinDamage: enemyData.naturalMinDamage,
		naturalMaxDamage: enemyData.naturalMaxDamage,
		naturalDamageType: enemyData.naturalDamageType,
	};
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
		if (battleRecord && battleRecord.state === BattleState.Active) {
			throw createHttpError(httpStatus.BAD_REQUEST, "Battle already exists");
		}

		if (battleRecord) {
			await EnemyModel.findByIdAndDelete(battleRecord.enemy);
			await battleRecord.deleteOne();
		}

		const level = characterRecord.startingBattleLevel;
		const zone = Game.getZone(level);
		const enemyData = getEnemyData(level);

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
		const zone = Game.getZone(level);
		const enemyData = getEnemyData(level);

		const enemy = await EnemyModel.create(enemyData);

		const battle = await BattleModel.create({
			user: user.id,
			hero: characterRecord.id,
			enemy: enemy.id,
			zone,
			level,
		});

		await EnemyModel.findByIdAndDelete(battleRecord.enemy);
		await battleRecord.deleteOne();

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

		characterRecord.streak = 0;
		characterRecord.state = State.Idle;

		const character = await characterRecord.save();
		const battle = await battleRecord.save();

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

		if (!characterRecord.alive) {
			battleRecord.result = BattleResult.Lost;
			characterRecord.battleLost(enemyRecord.name);
		}

		if (characterRecord.alive && !enemyRecord.alive) {
			battleRecord.handleReward(characterRecord, enemyRecord);
			battleRecord.handleTreasure(characterRecord, enemyRecord);
			battleRecord.result = BattleResult.Won;
			characterRecord.battleWon(battleRecord);
		}

		const character = await characterRecord.save();
		const enemy = await enemyRecord.save();
		const battle = await battleRecord.save();

		if (!character.alive) {
			await battle.deleteOne();
			await enemy.deleteOne();
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

		const character = await characterRecord.save();
		const battle = await battleRecord.save();

		return {
			battle: battle.toJSON(),
			character: character.toJSON(),
		};
	} catch (error) {
		console.error(`Error takeTreasure: ${error.message}`);
		throw error;
	}
}
