import mongoose from "mongoose";
import { ICharacter, ICharacterInput, ICharacterService } from "src/types/character";
import { Inject, Service } from "typedi";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { Session, SessionData } from "express-session";
import { Status } from "src/enums/character";
import { GameDataService } from "src/game/services/gameDataService";
import { GameService } from "src/game/services/gameService";

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
			const characterRecord = await this.characterModel.findOne({ userId: user.id });
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
			const characters = await this.characterModel.find({ userId: user.id, status: Status.Alive });
			if (characters.length) {
				throw createHttpError(httpStatus.BAD_REQUEST, `An active character already exists`);
			}

			const classData = this.gameDataService.getCharacterClassByName(characterClass);
			const hitPoints = this.gameService.getHitPoints(classData.stats.constitution);
			const skills = classData.skills.map((skill) => ({
				skill,
				used: this.gameDataService.getSkillById(skill).maxUses,
			}));

			const characterRecord = await this.characterModel.create({
				name,
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
}
