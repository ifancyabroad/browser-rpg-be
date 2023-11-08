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
			character: characterRecord.id,
			state: BattleState.Active,
		});
		if (battleRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "Battle already exists");
		}

		const enemyData = GameData.getEnemy(characterRecord.day);
		const level = characterRecord.day;
		const hitPoints = Game.getHitPoints(level);
		const skills = enemyData.skills.map((id) => ({
			id,
			remaining: GameData.getSkillById(id).maxUses,
		}));
		const equipment = "equipment" in enemyData ? enemyData.equipment : undefined;

		const enemy = await EnemyModel.create({
			battle: battleRecord.id,
			name: enemyData.name,
			image: enemyData.portrait,
			level,
			challenge: enemyData.challenge,
			skills,
			equipment,
			stats: enemyData.stats,
			resistances: enemyData.resistances,
			hitPoints,
			maxHitPoints: hitPoints,
		});

		const battle = await BattleModel.create({
			user: user.id,
			character: characterRecord.id,
			enemy: enemy.id,
		});

		characterRecord.state = State.Battle;
		const character = await characterRecord.save();

		return {
			battle: battle.toJSON(),
			enemy: enemy.toJSON({ virtuals: true }),
			character: character.toJSON({ virtuals: true }),
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
			character: characterRecord.id,
			state: BattleState.Active,
		});
		if (!battleRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No active battle found");
		}

		const enemyRecord = await EnemyModel.findById(battleRecord.enemy);

		return {
			battle: battleRecord.toJSON(),
			enemy: enemyRecord.toJSON({ virtuals: true }),
			character: characterRecord.toJSON({ virtuals: true }),
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
			character: characterRecord.id,
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

		if (!characterRecord.vAlive) {
			characterRecord.battleLost(enemyRecord.name);
			battleRecord.state = BattleState.Lost;
		}

		if (characterRecord.vAlive && !enemyRecord.vAlive) {
			characterRecord.battleWon(enemyRecord.vReward);
			battleRecord.reward = enemyRecord.vReward;
			battleRecord.state = BattleState.Won;
		}

		const battle = await battleRecord.save();
		const enemy = await enemyRecord.save();
		const character = await characterRecord.save();

		return {
			battle: battle.toJSON(),
			enemy: enemy.toJSON({ virtuals: true }),
			character: character.toJSON({ virtuals: true }),
		};
	} catch (error) {
		console.error(`Error getBattle: ${error.message}`);
		throw error;
	}
}
