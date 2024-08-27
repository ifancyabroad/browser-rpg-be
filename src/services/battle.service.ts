import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { Session, SessionData } from "express-session";
import { BattleState, State, Status } from "@common/utils/enums/index";
import { GameData } from "@common/utils/game/GameData";
import { Game } from "@common/utils/game/Game";
import { IBattleInput } from "@common/types/battle";
import BattleModel from "@models/battle.model";
import HeroModel from "@models/hero.model";
import EnemyModel from "@models/enemy.model";

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
			state: BattleState.Active,
		});
		if (battleRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "Battle already exists");
		}

		const isBoss = characterRecord.kills % 10 === 0;
		const enemyData = GameData.getEnemy(characterRecord.zone.level, isBoss);
		const level = characterRecord.day;
		const hitPoints = Game.getHitPoints(level);
		const skills = enemyData.skills.map((id) => ({
			id,
			remaining: GameData.getSkillById(id).maxUses,
		}));
		const equipment = "equipment" in enemyData ? enemyData.equipment : undefined;

		const enemy = await EnemyModel.create({
			name: enemyData.name,
			image: enemyData.portrait,
			level,
			challenge: enemyData.challenge,
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
		});

		const battle = await BattleModel.create({
			user: user.id,
			hero: characterRecord.id,
			enemy: enemy.id,
			zone: characterRecord.zone,
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
			battleRecord.state = BattleState.Lost;
			characterRecord.battleLost(enemyRecord.name);
		}

		if (characterRecord.alive && !enemyRecord.alive) {
			battleRecord.handleReward(characterRecord, enemyRecord);
			battleRecord.state = BattleState.Won;
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
