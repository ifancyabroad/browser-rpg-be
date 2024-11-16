import { IBuyItemInput, IBuyPotionInput, ICharacterInput, ILevelUpInput } from "@common/types/character";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { Session, SessionData } from "express-session";
import { State, Status } from "@common/utils/enums/index";
import { GameData } from "@common/utils/game/GameData";
import { Game } from "@common/utils/game/Game";
import HeroModel, { HeroArchive } from "@models/hero.model";
import { FINAL_LEVEL, SHOP_ITEMS, STARTING_GOLD, STARTING_POTIONS } from "@common/utils";
import BattleModel from "@models/battle.model";
import EnemyModel from "@models/enemy.model";

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
		const availableItems = GameData.getWeightedItems(characterClass, SHOP_ITEMS, 0);

		const characterRecord = await HeroModel.create({
			user: user.id,
			name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
			characterClassID: characterClass,
			skillIDs: skills,
			equipmentIDs: classData.equipment,
			availableItemIDs: availableItems,
			gold: STARTING_GOLD,
			potions: STARTING_POTIONS,
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
			{ user: user.id, status: Status.Alive },
			{ status: Status.Retired },
			{ new: true },
		);
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "Character cannot be retired");
		}

		const battleRecord = await BattleModel.findOneAndDelete({ hero: characterRecord.id });
		if (battleRecord) {
			await EnemyModel.findByIdAndDelete(battleRecord.enemy);
		}

		await HeroArchive.create(
			characterRecord.toJSON({
				virtuals: false,
				depopulate: true,
				versionKey: false,
				transform: (doc, ret) => {
					delete ret.__t;
					return ret;
				},
			}),
		);
		await characterRecord.deleteOne();

		return characterRecord.toJSON();
	} catch (error) {
		console.error(`Error retireActiveCharacter: ${error.message}`);
		throw error;
	}
}

export async function buyItem(item: IBuyItemInput, session: Session & Partial<SessionData>) {
	const { id, slot } = item;
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

		characterRecord.checkItem(id, slot);
		characterRecord.buyItem(id);
		characterRecord.equipItem(id, slot);
		const character = await characterRecord.save();

		return character.toJSON();
	} catch (error) {
		console.error(`Error buyItem: ${error.message}`);
		throw error;
	}
}

export async function restockItems(session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to restock items");
		}

		if (characterRecord.gold < characterRecord.restockPrice) {
			throw createHttpError(httpStatus.BAD_REQUEST, "Not enough gold to restock items");
		}

		characterRecord.gold -= characterRecord.restockPrice;
		characterRecord.restockCount++;
		characterRecord.restock();
		const character = await characterRecord.save();

		return character.toJSON();
	} catch (error) {
		console.error(`Error restockItems: ${error.message}`);
		throw error;
	}
}

export async function buyPotion(potion: IBuyPotionInput, session: Session & Partial<SessionData>) {
	const { quantity } = potion;
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to buy potion");
		}

		characterRecord.buyPotion(quantity);
		const character = await characterRecord.save();

		return character.toJSON();
	} catch (error) {
		console.error(`Error buyPotion: ${error.message}`);
		throw error;
	}
}

export async function rest(session: Session & Partial<SessionData>) {
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

		if (characterRecord.gold < characterRecord.restPrice) {
			throw createHttpError(httpStatus.BAD_REQUEST, "Not enough gold to rest");
		}

		characterRecord.gold -= characterRecord.restPrice;
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

export async function swapWeapons(session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterRecord = await HeroModel.findOne({
			user: user.id,
			status: Status.Alive,
			state: State.Idle,
		});
		if (!characterRecord) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to swap weapons");
		}

		characterRecord.swapWeapons();
		const character = await characterRecord.save();

		return character.toJSON();
	} catch (error) {
		console.error(`Error swapWeapons: ${error.message}`);
		throw error;
	}
}

export async function getProgress(session: Session & Partial<SessionData>) {
	const { user } = session;
	try {
		const characterClasses = GameData.getClasses();

		const allCharacters = await HeroArchive.find({ user: user.id }).sort({ kills: "desc" });

		if (!allCharacters) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No eligible characters to get progress");
		}

		const topCharacter = allCharacters[0];

		let rank = null;

		if (topCharacter) {
			rank = (await HeroArchive.find({ kills: { $gt: topCharacter.kills } }).countDocuments()) + 1;
		}

		const victories = allCharacters.filter((character) => character.kills >= FINAL_LEVEL).length;
		const kills = allCharacters.reduce((acc, character) => acc + character.kills, 0);
		const deaths = allCharacters.filter((character) => character.status === Status.Dead).length;
		const days = allCharacters.reduce((acc, character) => acc + character.day, 0);

		const overallProgress = allCharacters.slice(0, 3).map((character) => character.toJSON());

		const classProgress = characterClasses
			.map(({ id }) => {
				const characters = allCharacters.filter((character) => character.characterClassID === id);

				if (!characters.length) {
					return null;
				}

				return characters[0].toJSON();
			})
			.filter((character) => character);

		return {
			overallProgress,
			classProgress,
			rank,
			victories,
			kills,
			deaths,
			days,
		};
	} catch (error) {
		console.error(`Error getProgress: ${error.message}`);
		throw error;
	}
}
