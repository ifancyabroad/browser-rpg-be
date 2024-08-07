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
import MapModel from "@models/map.model";
import { IMapLocation } from "@common/types/map";

export async function startBattle(location: IMapLocation, session: Session & Partial<SessionData>) {
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

		const mapRecord = await MapModel.findById(characterRecord.map.id);
		mapRecord.move(location);
		if (!mapRecord.isBattle && !mapRecord.isBoss) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No battle in this room");
		}

		const enemyData = GameData.getEnemy(mapRecord.location.level + 1, mapRecord.isBoss);
		const level = enemyData.challenge;
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
			map: mapRecord.id,
			location: mapRecord.location,
		});

		characterRecord.state = State.Battle;

		await mapRecord.save();
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

		const mapRecord = await MapModel.findById(characterRecord.map);

		if (!characterRecord.alive) {
			battleRecord.state = BattleState.Lost;
			characterRecord.battleLost(enemyRecord.name);
		}

		if (characterRecord.alive && !enemyRecord.alive) {
			battleRecord.handleReward(characterRecord, enemyRecord);
			battleRecord.state = BattleState.Won;
			characterRecord.battleWon(battleRecord.reward);
			mapRecord.completeRoom();
			await mapRecord.save();
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
