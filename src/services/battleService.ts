import mongoose from "mongoose";
import { ICharacter, ISkill } from "types/character";
import { Inject, Service } from "typedi";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { Session, SessionData } from "express-session";
import { BattleState, EffectType, State, Status } from "@utils/enums/index";
import { GameDataService } from "@game/services/gameDataService";
import { GameService } from "@game/services/gameService";
import { IBattle, IBattleInput, IBattleService } from "types/battle";
import { CharacterService } from "./characterService";
import { TEnemy } from "types/gameData";

/* Battle service */
@Service()
export class BattleService implements IBattleService {
	constructor(
		@Inject("characterModel") private characterModel: mongoose.Model<ICharacter & mongoose.Document>,
		@Inject("battleModel") private battleModel: mongoose.Model<IBattle & mongoose.Document>,
		@Inject() private gameDataService: GameDataService,
		@Inject() private gameService: GameService,
		@Inject() private characterService: CharacterService,
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

			const enemyData = this.gameDataService.getEnemy(characterRecord.day);
			const level = characterRecord.day;
			const hitPoints = this.gameService.getHitPoints(enemyData.stats.constitution, level);
			const skills = enemyData.skills.map((id) => ({
				id,
				remaining: this.gameDataService.getSkillById(id).maxUses,
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
			const character = this.characterService.populateCharacter(newCharacter.toObject());

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

			const character = this.characterService.populateCharacter(characterRecord.toObject());

			return { battle, character };
		} catch (error) {
			console.error(`Error getBattle: ${error.message}`);
			throw error;
		}
	}

	private handleAction(character: ICharacter | TEnemy, skill: ISkill) {
		const equipment = "equipment" in character ? character.equipment : {};
		const allEquipment = this.gameDataService.getEquipment(equipment);
		const weapons = this.gameDataService.getWeapons(equipment);
		const skillData = this.gameDataService.getSkillById(skill.id);

		skillData.effects.forEach((effect) => {
			switch (effect.type) {
				case EffectType.WeaponDamage:
					const damage = this.gameService.handleWeaponDamage(weapons, allEquipment, character.stats);
					break;
				case EffectType.Damage:
					break;
				case EffectType.Heal:
					break;
				case EffectType.Status:
					break;
				case EffectType.Auxiliary:
					break;
			}
		});
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

			const skill = characterRecord.skills.find((sk) => sk.id === id && sk.remaining > 0);
			if (!skill) {
				throw createHttpError(httpStatus.BAD_REQUEST, "Skill is not available");
			}

			skill.remaining--;
			const turn = this.handleAction(characterRecord, skill);

			const character = this.characterService.populateCharacter(characterRecord.toObject());

			return { battle, character };
		} catch (error) {
			console.error(`Error getBattle: ${error.message}`);
			throw error;
		}
	}
}
