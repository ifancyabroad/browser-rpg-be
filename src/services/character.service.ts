import { IBuyItemInput, ICharacterInput, ILevelUpInput } from "@common/types/character";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { Session, SessionData } from "express-session";
import { State, Status } from "@common/utils/enums/index";
import { GameData } from "@game/GameData";
import { Hero } from "@game/Hero";
import { Game } from "@game/Game";
import CharacterModel from "@models/character.model";

export async function getActiveCharacter(session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await CharacterModel.findOne({ user: user.id, status: Status.Alive });
		if (characterRecord) {
			return new Hero(characterRecord.toObject()).characterJSON;
		}

		return null;
	} catch (error) {
		console.error(`Error getActiveCharacter: ${error.message}`);
		throw error;
	}
}

export async function createCharacter(characterInput: ICharacterInput, session: Session & Partial<SessionData>) {
	const { name, characterClass } = characterInput;
	const { user } = session;
	try {
		const characters = await CharacterModel.find({ user: user.id, status: Status.Alive });
		if (characters.length) {
			throw createHttpError(httpStatus.BAD_REQUEST, `An active character already exists`);
		}

		const classData = GameData.getCharacterClassById(characterClass);
		const hitPoints = Game.getHitPoints();
		const skills = classData.skills.map((id) => ({
			id,
			remaining: GameData.getSkillById(id).maxUses,
		}));
		const availableItems = GameData.getShopItems(characterClass, 1);

		const characterRecord = await CharacterModel.create({
			user: user.id,
			name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
			characterClass,
			skills,
			equipment: classData.equipment,
			availableItems,
			stats: classData.stats,
			hitPoints,
			maxHitPoints: hitPoints,
		});

		return new Hero(characterRecord.toObject()).characterJSON;
	} catch (error) {
		console.error(`Error createCharacter: ${error.message}`);
		throw error;
	}
}

export async function retireActiveCharacter(session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await CharacterModel.findOneAndUpdate(
			{ user: user.id, status: Status.Alive, state: State.Idle },
			{ status: Status.Retired },
			{ new: true },
		);
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "Character cannot be retired");
		}

		return new Hero(characterRecord.toObject()).characterJSON;
	} catch (error) {
		console.error(`Error retireActiveCharacter: ${error.message}`);
		throw error;
	}
}

export async function buyItem(item: IBuyItemInput, session: Session & Partial<SessionData>) {
	const { id, slot } = item;
	const { user } = session;
	try {
		const character = await CharacterModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
		});
		if (!character) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to buy item");
		}

		const hero = new Hero(character.toObject());
		hero.buyItem(id, slot);
		await character.updateOne({ $set: hero.data }, { new: true });

		return hero.characterJSON;
	} catch (error) {
		console.error(`Error buyItem: ${error.message}`);
		throw error;
	}
}

export async function rest(session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const character = await CharacterModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
		});
		if (!character) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to rest");
		}

		const hero = new Hero(character.toObject());
		hero.rest();
		await character.updateOne({ $set: hero.data }, { new: true });

		return hero.characterJSON;
	} catch (error) {
		console.error(`Error rest: ${error.message}`);
		throw error;
	}
}

export async function levelUp(levelUp: ILevelUpInput, session: Session & Partial<SessionData>) {
	const { stat, skill } = levelUp;
	const { user } = session;
	try {
		const character = await CharacterModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
		});
		if (!character) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to level up");
		}

		const hero = new Hero(character.toObject());
		hero.levelUp(stat, skill);
		await character.updateOne({ $set: hero.data }, { new: true });

		return hero.characterJSON;
	} catch (error) {
		console.error(`Error levelUp: ${error.message}`);
		throw error;
	}
}
