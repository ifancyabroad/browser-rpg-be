import mongoose from "mongoose";
import { IBuyItemInput, ICharacter, ICharacterInput, ICharacterService, IEquipment } from "types/character";
import { Inject, Service } from "typedi";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { Session, SessionData } from "express-session";
import { EquipmentSlot, EquipmentType, State, Status, WeaponSize } from "@utils/enums/index";
import { GameDataService } from "@game/services/gameDataService";
import { GameService } from "@game/services/gameService";
import { EQUIPMENT_SLOT_TYPE_MAP } from "@utils/constants";

/* Character service */
@Service()
export class CharacterService implements ICharacterService {
	constructor(
		@Inject("characterModel") private characterModel: mongoose.Model<ICharacter & mongoose.Document>,
		@Inject() private gameDataService: GameDataService,
		@Inject() private gameService: GameService,
	) {}

	private populateCharacter(
		character: ICharacter &
			mongoose.Document<any, {}, ICharacter> & {
				_id: mongoose.Types.ObjectId;
			},
	) {
		return {
			...character,
			skills: this.gameDataService.populateSkills(character.skills),
			equipment: this.gameDataService.populateEquipment(character.equipment),
			availableItems: this.gameDataService.populateAvailableItems(character.availableItems),
			characterClass: this.gameDataService.populateClass(character.characterClass),
		};
	}

	public async getActiveCharacter(session: Session & Partial<SessionData>) {
		const { user } = session;
		try {
			const characterRecord = await this.characterModel.findOne({ user: user.id, status: Status.Alive });
			if (characterRecord) {
				return this.populateCharacter(characterRecord.toObject());
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

			const classData = this.gameDataService.getCharacterClassById(characterClass);
			const hitPoints = this.gameService.getHitPoints(classData.stats.constitution);
			const skills = classData.skills.map((id) => ({
				id,
				remaining: this.gameDataService.getSkillById(id).maxUses,
			}));
			const availableItems = this.gameDataService.getShopItems(characterClass, 1);

			const characterRecord = await this.characterModel.create({
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

			return this.populateCharacter(characterRecord.toObject());
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

			return this.populateCharacter(characterRecord.toObject());
		} catch (error) {
			console.error(`Error retireActiveCharacter: ${error.message}`);
			throw error;
		}
	}

	public async buyItem(item: IBuyItemInput, session: Session & Partial<SessionData>) {
		const { id, slot } = item;
		const { user } = session;
		try {
			const character = await this.characterModel.findOne({
				user: user.id,
				status: Status.Alive,
				state: State.Idle,
			});
			if (!character) {
				throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to buy item");
			}

			const itemData = this.gameDataService.getEquipmentById(id);

			if (!character.availableItems.includes(id)) {
				throw createHttpError(httpStatus.BAD_REQUEST, "Item is not available");
			}

			if (itemData.price > character.gold) {
				throw createHttpError(httpStatus.BAD_REQUEST, "Not enough gold");
			}

			const { armourTypes, weaponTypes } = this.gameDataService.getCharacterClassById(character.characterClass);
			const validArmourType = "armourType" in itemData && armourTypes.includes(itemData.armourType);
			const validWeaponType = "weaponType" in itemData && weaponTypes.includes(itemData.weaponType);
			if (!validArmourType && !validWeaponType) {
				throw createHttpError(httpStatus.BAD_REQUEST, "Class cannot use this item");
			}

			const slotTypes = EQUIPMENT_SLOT_TYPE_MAP.get(itemData.type as EquipmentType);
			if (!slotTypes.includes(slot)) {
				throw createHttpError(httpStatus.BAD_REQUEST, "Item cannot be equipped to this slot");
			}

			const isTwoHandedWeapon = "size" in itemData && itemData.size === WeaponSize.TwoHanded;
			const offHand = isTwoHandedWeapon ? null : character.equipment.hand2;

			character.gold = character.gold - itemData.price;
			character.availableItems = character.availableItems.filter((item) => item !== id);
			character.equipment = {
				...character.equipment,
				[EquipmentSlot.Hand2]: offHand,
				[slot]: id,
			};

			const characterRecord = await character.save();

			return this.populateCharacter(characterRecord.toObject());
		} catch (error) {
			console.error(`Error buyItem: ${error.message}`);
			throw error;
		}
	}

	public async rest(session: Session & Partial<SessionData>) {
		const { user } = session;
		try {
			const character = await this.characterModel.findOne({
				user: user.id,
				status: Status.Alive,
				state: State.Idle,
			});
			if (!character) {
				throw createHttpError(httpStatus.BAD_REQUEST, "No eligible character to rest");
			}

			const price = this.gameService.getRestPrice(character.day);
			if (price > character.gold) {
				throw createHttpError(httpStatus.BAD_REQUEST, "Not enough gold");
			}

			character.gold = character.gold - price;
			character.day = character.day + 1;
			character.availableItems = this.gameDataService.getShopItems(character.characterClass, character.level);
			character.hitPoints = character.maxHitPoints;
			character.skills.forEach((skill) => {
				const skillData = this.gameDataService.getSkillById(skill.id);
				return (skill.remaining = skillData.maxUses);
			});

			const characterRecord = await character.save();

			return this.populateCharacter(characterRecord.toObject());
		} catch (error) {
			console.error(`Error rest: ${error.message}`);
			throw error;
		}
	}
}
