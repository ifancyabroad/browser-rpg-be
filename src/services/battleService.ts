import mongoose from "mongoose";
import { IHero } from "@common/types/character";
import { Inject, Service } from "typedi";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { Session, SessionData } from "express-session";
import { BattleState, State, Status } from "@common/utils/enums/index";
import { GameData } from "@game/GameData";
import { Game } from "@game/Game";
import { IBattle, IBattleInput, IBattleService } from "@common/types/battle";
import { Hero } from "@game/Hero";
import { Enemy } from "@game/Enemy";

/* Battle service */
@Service()
export class BattleService implements IBattleService {
	constructor(
		@Inject("characterModel") private characterModel: mongoose.Model<IHero & mongoose.Document>,
		@Inject("battleModel") private battleModel: mongoose.Model<IBattle & mongoose.Document>,
	) {}

	public async startBattle(session: Session & Partial<SessionData>) {
		const { user } = session;
		try {
			const characterRecord = await this.characterModel.findOne({
				user: user.id,
				status: Status.Alive,
				state: State.Idle,
			});
			if (!characterRecord) {
				throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character found");
			}

			const battleRecord = await this.battleModel.findOne({
				character: characterRecord.id,
				state: BattleState.Active,
			});
			if (battleRecord) {
				throw createHttpError(httpStatus.BAD_REQUEST, "Battle already exists");
			}

			const enemyData = GameData.getEnemy(characterRecord.day);
			const level = characterRecord.day;
			const hitPoints = Game.getHitPoints(enemyData.stats.constitution, level);
			const skills = enemyData.skills.map((id) => ({
				id,
				remaining: GameData.getSkillById(id).maxUses,
			}));
			const equipment = "equipment" in enemyData ? enemyData.equipment : undefined;
			const enemy = {
				id: enemyData.id,
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
			};

			const battle = await this.battleModel.create({
				user: user.id,
				character: characterRecord.id,
				enemy,
			});

			characterRecord.state = State.Battle;
			const newCharacter = await characterRecord.save();
			const character = new Hero(newCharacter.toObject()).characterJSON;

			return { battle, character };
		} catch (error) {
			console.error(`Error startBattle: ${error.message}`);
			throw error;
		}
	}

	public async getBattle(session: Session & Partial<SessionData>) {
		const { user } = session;
		try {
			const characterRecord = await this.characterModel.findOne({
				user: user.id,
				status: Status.Alive,
				state: State.Battle,
			});
			if (!characterRecord) {
				throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character found");
			}

			const battle = await this.battleModel.findOne({
				character: characterRecord.id,
				state: BattleState.Active,
			});
			if (!battle) {
				throw createHttpError(httpStatus.BAD_REQUEST, "No active battle found");
			}

			const character = new Hero(characterRecord.toObject()).characterJSON;

			return { battle, character };
		} catch (error) {
			console.error(`Error getBattle: ${error.message}`);
			throw error;
		}
	}

	public async action(skill: IBattleInput, session: Session & Partial<SessionData>) {
		const { id } = skill;
		const { user } = session;
		try {
			const characterRecord = await this.characterModel.findOne({
				user: user.id,
				status: Status.Alive,
				state: State.Battle,
			});
			if (!characterRecord) {
				throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character found");
			}

			const battleRecord = await this.battleModel.findOne({
				character: characterRecord.id,
				state: BattleState.Active,
			});
			if (!battleRecord) {
				throw createHttpError(httpStatus.BAD_REQUEST, "No battle found");
			}

			const hero = new Hero(characterRecord.toObject());
			const enemy = new Enemy(battleRecord.enemy);
			const turn = Game.handleTurn(
				{
					self: hero,
					enemy,
					skill: id,
				},
				{
					self: enemy,
					enemy: hero,
					skill: enemy.skill.id,
				},
			);

			battleRecord.enemy = enemy.data;
			battleRecord.turns.push(turn);

			if (!hero.alive) {
				hero.battleLost(enemy.data.name);
				battleRecord.state = BattleState.Lost;
			}

			if (hero.alive && !enemy.alive) {
				hero.battleWon(enemy.reward);
				battleRecord.reward = enemy.reward;
				battleRecord.state = BattleState.Won;
			}

			const battle = await battleRecord.save();

			await characterRecord.updateOne({ $set: hero.data }, { new: true });
			const character = hero.characterJSON;

			return { battle, character };
		} catch (error) {
			console.error(`Error getBattle: ${error.message}`);
			throw error;
		}
	}
}
