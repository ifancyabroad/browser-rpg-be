import mongoose from "mongoose";
import { ICharacter } from "types/character";
import { Inject, Service } from "typedi";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { Session, SessionData } from "express-session";
import { State, Status } from "enums";
import { GameDataService } from "game/services/gameDataService";
import { GameService } from "game/services/gameService";
import { IBattle, IBattleService } from "types/battle";

/* Battle service */
@Service()
export class BattleService implements IBattleService {
	constructor(
		@Inject("characterModel") private characterModel: mongoose.Model<ICharacter & mongoose.Document>,
		@Inject("battleModel") private battleModel: mongoose.Model<IBattle & mongoose.Document>,
		@Inject() private gameDataService: GameDataService,
		@Inject() private gameService: GameService,
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

			const battleRecord = await this.battleModel.create({
				user: user.id,
			});

			return battleRecord;
		} catch (error) {
			console.error(`Error startBattle: ${error.message}`);
			throw error;
		}
	}
}
