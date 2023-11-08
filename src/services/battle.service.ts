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
import { IEnemy, IEnemyMethods } from "@common/types/enemy";

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

		const enemyData = GameData.getEnemy(characterRecord.day);
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
		});

		const battle = await BattleModel.create({
			user: user.id,
			hero: characterRecord.id,
			enemy: enemy.id,
		});

		await battle.populate<{ enemy: IEnemy & IEnemyMethods }>("enemy");

		characterRecord.state = State.Battle;
		const character = await characterRecord.save();

		return {
			battle: battle.toJSON({ virtuals: true }),
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
			hero: characterRecord.id,
			state: BattleState.Active,
		}).populate<{ enemy: IEnemy & IEnemyMethods }>("enemy");
		if (!battleRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No active battle found");
		}

		return {
			battle: battleRecord.toJSON({ virtuals: true }),
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
			hero: characterRecord.id,
			state: BattleState.Active,
		}).populate<{ enemy: IEnemy & IEnemyMethods }>("enemy");
		if (!battleRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No battle found");
		}

		const turn = battleRecord.handleTurn(
			{
				self: characterRecord,
				enemy: battleRecord.enemy,
				skill: id,
			},
			{
				self: battleRecord.enemy,
				enemy: characterRecord,
				skill: battleRecord.enemy.getSkill(characterRecord).id,
			},
		);

		battleRecord.turns.push(turn);

		if (!characterRecord.alive) {
			characterRecord.battleLost(battleRecord.enemy.name);
			battleRecord.state = BattleState.Lost;
		}

		if (characterRecord.alive && !battleRecord.enemy.alive) {
			characterRecord.battleWon(battleRecord.enemy.reward);
			battleRecord.reward = battleRecord.enemy.reward;
			battleRecord.state = BattleState.Won;
		}

		const character = await characterRecord.save();
		const battle = await battleRecord.save();

		return {
			battle: battle.toJSON({ virtuals: true }),
			character: character.toJSON({ virtuals: true }),
		};
	} catch (error) {
		console.error(`Error getBattle: ${error.message}`);
		throw error;
	}
}