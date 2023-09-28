import mongoose from "mongoose";
import { IHero } from "types/character";
import { Inject, Service } from "typedi";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { Session, SessionData } from "express-session";
import { BattleState, State, Status, Target } from "@utils/enums/index";
import { GameData } from "@game/GameData";
import { Game } from "@game/Game";
import { IAction, IBattle, IBattleInput, IBattleService } from "types/battle";
import { Hero } from "@game/Hero";
import { Enemy } from "@game/Enemy";
import { Character } from "@game/Character";

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
				throw createHttpError(httpStatus.BAD_REQUEST, "No battle found");
			}

			const character = new Hero(characterRecord.toObject()).characterJSON;

			return { battle, character };
		} catch (error) {
			console.error(`Error getBattle: ${error.message}`);
			throw error;
		}
	}

	private handleAction(first: Character, second: Character, id: string) {
		const firstAction = first.createAction(id);
		const firstActionSelf = first.handleAction(firstAction, Target.Self);
		const firstActionFinal = second.handleAction(firstActionSelf, Target.Enemy);

		if (first.alive && second.alive) {
			const secondAction = first.createAction(id);
			const secondActionSelf = first.handleAction(secondAction, Target.Self);
			const secondActionFinal = second.handleAction(secondActionSelf, Target.Enemy);
			return [firstActionFinal, secondActionFinal];
		}

		return [firstActionFinal];
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

			const battle = await this.battleModel.findOne({
				character: characterRecord.id,
				state: BattleState.Active,
			});
			if (!battle) {
				throw createHttpError(httpStatus.BAD_REQUEST, "No battle found");
			}

			const hero = new Hero(characterRecord.toObject());
			const enemy = new Enemy(battle.enemy);
			const turn: IAction[][] = [];

			if (hero.stats.dexterity >= enemy.stats.dexterity) {
				turn.push(this.handleAction(hero, enemy, id));
			} else {
				turn.push(this.handleAction(enemy, hero, enemy.skill.id));
			}

			battle.enemy = enemy.data;
			battle.turns = battle.turns.concat(turn);
			battle.state = hero.alive && enemy.alive ? battle.state : BattleState.Complete;

			await battle.save();
			await characterRecord.updateOne({ $set: hero.data }, { new: true });

			const character = hero.characterJSON;

			return { battle, character };
		} catch (error) {
			console.error(`Error getBattle: ${error.message}`);
			throw error;
		}
	}
}
