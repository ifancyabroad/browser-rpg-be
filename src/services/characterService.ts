import mongoose from "mongoose";
import { ICharacter, ICharacterInput, ICharacterService } from "types/character";
import { Inject, Service } from "typedi";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { Session, SessionData } from "express-session";
import { State, Status } from "enums";
import { GameDataService } from "game/services/gameDataService";
import { GameService } from "game/services/gameService";

/* Character service */
@Service()
export class CharacterService implements ICharacterService {
	constructor(
		@Inject("characterModel") private characterModel: mongoose.Model<ICharacter & mongoose.Document>,
		@Inject() private gameDataService: GameDataService,
		@Inject() private gameService: GameService,
	) {}

	public async getActiveCharacter(session: Session & Partial<SessionData>) {
		const { user } = session;
		try {
			const characterRecord = await this.characterModel.findOne({ user: user.id, status: Status.Alive });
			if (characterRecord) {
				return characterRecord;
			}

			return null;
		} catch (error) {
			console.error(`Error getActiveCharacter: ${error.message}`);
			throw error;
		}
	}

	public async createCharacter(characterInput: ICharacterInput, session: Session & Partial<SessionData>) {
		const { name, characterClass } = characterInput;
		const { user } = session;
		try {
			const characters = await this.characterModel.find({ user: user.id, status: Status.Alive });
			if (characters.length) {
				throw createHttpError(httpStatus.BAD_REQUEST, `An active character already exists`);
			}

			const classData = this.gameDataService.getCharacterClassByName(characterClass);
			const hitPoints = this.gameService.getHitPoints(classData.stats.constitution);
			const skills = classData.skills.map((skill) => ({
				skill,
				remaining: this.gameDataService.getSkillById(skill).maxUses,
			}));

			const characterRecord = await this.characterModel.create({
				user: user.id,
				name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
				characterClass: classData.skillClass,
				skills,
				equipment: classData.equipment,
				stats: classData.stats,
				hitPoints,
			});

			return characterRecord;
		} catch (error) {
			console.error(`Error createCharacter: ${error.message}`);
			throw error;
		}
	}

	public async retireActiveCharacter(session: Session & Partial<SessionData>) {
		const { user } = session;
		try {
			const characterRecord = await this.characterModel.findOneAndUpdate(
				{ user: user.id, status: Status.Alive, state: State.Idle },
				{ status: Status.Retired },
				{ new: true },
			);
			if (!characterRecord) {
				throw createHttpError(httpStatus.BAD_REQUEST, "Character cannot be retired");
			}

			return characterRecord;
		} catch (error) {
			console.error(`Error retireActiveCharacter: ${error.message}`);
			throw error;
		}
	}
}
