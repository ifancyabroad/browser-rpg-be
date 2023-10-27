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

	private getBattleResponse(battle: IBattle, character: Hero, enemy: Enemy) {
		return {
			battle: { ...battle, enemy: enemy.characterJSON },
			character: character.characterJSON,
		};
	}

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
			const hitPoints = Game.getHitPoints(level);
			const skills = enemyData.skills.map((id) => ({
				id,
				remaining: GameData.getSkillById(id).maxUses,
			}));
			const equipment = "equipment" in enemyData ? enemyData.equipment : undefined;

			const battle = await this.battleModel.create({
				user: user.id,
				character: characterRecord.id,
				enemy: {
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
				},
			});

			characterRecord.state = State.Battle;
			const newCharacter = await characterRecord.save();
			const character = new Hero(newCharacter.toObject());
			const enemy = new Enemy(battle.enemy.toObject());

			return this.getBattleResponse(battle.toObject(), character, enemy);
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

			const character = new Hero(characterRecord.toObject());
			const enemy = new Enemy(battle.enemy.toObject());

			return this.getBattleResponse(battle.toObject(), character, enemy);
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

			const character = new Hero(characterRecord.toObject());
			const enemy = new Enemy(battleRecord.enemy.toObject());
			const turn = Game.handleTurn(
				{
					self: character,
					enemy,
					skill: id,
				},
				{
					self: enemy,
					enemy: character,
					skill: enemy.getSkill(character).id,
				},
			);

			battleRecord.enemy = enemy.data;
			battleRecord.turns.push(turn);

			if (!character.alive) {
				character.battleLost(enemy.data.name);
				battleRecord.state = BattleState.Lost;
			}

			if (character.alive && !enemy.alive) {
				character.battleWon(enemy.reward);
				battleRecord.reward = enemy.reward;
				battleRecord.state = BattleState.Won;
			}

			const battle = await battleRecord.save();
			await characterRecord.updateOne({ $set: character.data }, { new: true });

			return this.getBattleResponse(battle.toObject(), character, enemy);
		} catch (error) {
			console.error(`Error getBattle: ${error.message}`);
			throw error;
		}
	}
}
