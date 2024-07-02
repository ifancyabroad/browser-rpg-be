import { IBuyItemInput, ICharacterInput, ILevelUpInput, ITreasureInput } from "@common/types/character";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { Session, SessionData } from "express-session";
import { State, Status } from "@common/utils/enums/index";
import { GameData } from "@common/utils/game/GameData";
import { Game } from "@common/utils/game/Game";
import HeroModel from "@models/hero.model";
import MapModel from "@models/map.model";
import { IMapLocation } from "@common/types/map";

export async function getActiveCharacter(session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({ user: user.id, status: Status.Alive });
		if (characterRecord) {
			return characterRecord.toJSON();
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
		const characters = await HeroModel.find({ user: user.id, status: Status.Alive });
		if (characters.length) {
			throw createHttpError(httpStatus.BAD_REQUEST, `An active character already exists`);
		}

		const classData = GameData.getCharacterClassById(characterClass);
		const hitPoints = Game.getHitPoints();
		const skills = classData.skills.map((id) => ({
			id,
			remaining: GameData.getSkillById(id).maxUses,
		}));
		const availableItems = GameData.getClassItems(characterClass, 2, 6);

		const levels = GameData.getLevels();
		const location = GameData.getStartingLocation(levels);
		const map = await MapModel.create({ levels, location });

		const characterRecord = await HeroModel.create({
			user: user.id,
			map: map.id,
			name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
			characterClassID: characterClass,
			skillIDs: skills,
			equipmentIDs: classData.equipment,
			availableItemIDs: availableItems,
			baseStats: classData.stats,
			baseHitPoints: hitPoints,
			baseMaxHitPoints: hitPoints,
		});

		return characterRecord.toJSON();
	} catch (error) {
		console.error(`Error createCharacter: ${error.message}`);
		throw error;
	}
}

export async function retireActiveCharacter(session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOneAndUpdate(
			{ user: user.id, status: Status.Alive, state: State.Idle },
			{ status: Status.Retired },
			{ new: true },
		);
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "Character cannot be retired");
		}

		return characterRecord.toJSON();
	} catch (error) {
		console.error(`Error retireActiveCharacter: ${error.message}`);
		throw error;
	}
}

export async function buyItem(item: IBuyItemInput, session: Session & Partial<SessionData>) {
	const { id, slot, location } = item;
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to buy item");
		}

		const mapRecord = await MapModel.findById(characterRecord.map.id);
		mapRecord.move(location);
		if (!mapRecord.isShop) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No shop in this room");
		}

		characterRecord.checkItem(id, slot);
		characterRecord.buyItem(id);
		characterRecord.equipItem(id, slot);

		if (!characterRecord.availableItems.length) {
			mapRecord.completeRoom();
		}

		await mapRecord.save();
		const character = await characterRecord.save();

		return character.toJSON();
	} catch (error) {
		console.error(`Error buyItem: ${error.message}`);
		throw error;
	}
}

export async function rest(location: IMapLocation, session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to rest");
		}

		const mapRecord = await MapModel.findById(characterRecord.map.id);
		mapRecord.move(location);
		if (!mapRecord.isRest) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No campfire in this room");
		}

		mapRecord.completeRoom();
		await mapRecord.save();

		characterRecord.rest();
		const character = await characterRecord.save();

		return character.toJSON();
	} catch (error) {
		console.error(`Error rest: ${error.message}`);
		throw error;
	}
}

export async function levelUp(levelUp: ILevelUpInput, session: Session & Partial<SessionData>) {
	const { stat, skill } = levelUp;
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to level up");
		}

		characterRecord.addLevel(stat, skill);
		const character = await characterRecord.save();

		return character.toJSON();
	} catch (error) {
		console.error(`Error levelUp: ${error.message}`);
		throw error;
	}
}

export async function move(location: IMapLocation, session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to move");
		}

		const mapRecord = await MapModel.findById(characterRecord.map);

		mapRecord.move(location);
		await mapRecord.save();
		const character = await characterRecord.save();

		return character.toJSON();
	} catch (error) {
		console.error(`Error move: ${error.message}`);
		throw error;
	}
}

export async function nextLevel(location: IMapLocation, session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to proceed");
		}

		const mapRecord = await MapModel.findById(characterRecord.map);
		mapRecord.move(location);
		if (!mapRecord.isExit) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No exit in this room");
		}
		mapRecord.nextLevel();
		await mapRecord.save();

		characterRecord.restock(mapRecord.location.level + 2);
		const character = await characterRecord.save();

		return character.toJSON();
	} catch (error) {
		console.error(`Error nextLevel: ${error.message}`);
		throw error;
	}
}

export async function createTreasure(location: IMapLocation, session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to proceed");
		}

		const mapRecord = await MapModel.findById(characterRecord.map);
		mapRecord.move(location);
		if (!mapRecord.isTreasure) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No treasure in this room");
		}

		mapRecord.createTreasure(location, characterRecord.characterClassID);
		await mapRecord.save();

		const character = await characterRecord.save();

		return character.toJSON();
	} catch (error) {
		console.error(`Error createTreasure: ${error.message}`);
		throw error;
	}
}

export async function takeTreasure(item: ITreasureInput, session: Session & Partial<SessionData>) {
	const { id, slot, location } = item;
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to proceed");
		}

		const mapRecord = await MapModel.findById(characterRecord.map);
		mapRecord.move(location);
		if (!mapRecord.isTreasure) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No treasure in this room");
		}

		const treasure = mapRecord.getTreasure(location);
		if (id && !treasure.itemIDs.includes(id)) {
			throw createHttpError(httpStatus.BAD_REQUEST, "Item is not available!");
		}

		if (id) {
			characterRecord.checkItem(id, slot);
			characterRecord.equipItem(id, slot);
		} else {
			const goldReward = mapRecord.location.level * 25;
			characterRecord.gold += goldReward;
		}

		mapRecord.completeRoom();

		await mapRecord.save();
		const character = await characterRecord.save();

		return character.toJSON();
	} catch (error) {
		console.error(`Error takeTreasure: ${error.message}`);
		throw error;
	}
}
