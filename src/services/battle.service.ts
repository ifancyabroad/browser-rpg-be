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
import { ZONE_CHALLENGE_RATING_MAP } from "@common/utils";
import { IHero } from "@common/types/hero";

function getEnemyData(zone: Zone, characterRecord: IHero) {
	const challengeRating = ZONE_CHALLENGE_RATING_MAP.get(zone);
	const isBoss = characterRecord.streak % 10 === 0;
	const enemyData = GameData.getEnemy(challengeRating, isBoss);
	const level = characterRecord.day;
	const hitPoints = Game.getHitPoints(level);
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

export async function startBattle(zone: Zone, session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
			zone: Zone.Town,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character found");
		}

		const battleRecord = await BattleModel.findOne({
			hero: characterRecord.id,
			state: BattleState.Active,
		});
		if (battleRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "Battle already exists");
		}

		const enemyData = getEnemyData(zone, characterRecord);

		const enemy = await EnemyModel.create(enemyData);

		const battle = await BattleModel.create({
			user: user.id,
			hero: characterRecord.id,
			enemy: enemy.id,
			zone,
		});

		characterRecord.state = State.Battle;
		characterRecord.zone = zone;

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
			state: State.Idle,
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

		const enemyData = getEnemyData(characterRecord.zone, characterRecord);

		const enemy = await EnemyModel.create(enemyData);

		battleRecord.state = BattleState.Complete;
		await battleRecord.save();

		const battle = await BattleModel.create({
			user: user.id,
			hero: characterRecord.id,
			enemy: enemy.id,
			zone: characterRecord.zone,
		});

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
		characterRecord.zone = Zone.Town;

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
			characterRecord.battleWon(battleRecord.reward);
		}

		const character = await characterRecord.save();
		await enemyRecord.save();
		const battle = await battleRecord.save();

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
			state: State.Idle,
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

		if (!battleRecord.treasureItemIDs.includes(id)) {
			throw createHttpError(httpStatus.BAD_REQUEST, "Item not found in treasure");
		}

		if (id) {
			characterRecord.checkItem(id, slot);
			characterRecord.equipItem(id, slot);
		} else {
			const multiplier = ZONE_CHALLENGE_RATING_MAP.get(characterRecord.zone);
			const goldReward = multiplier * 25;
			characterRecord.gold += goldReward;
		}

		battleRecord.state = BattleState.Complete;

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
