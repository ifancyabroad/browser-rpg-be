import { Schema, Types } from "mongoose";
import { EquipmentSlot, EquipmentType, Stat, State, WeaponSize, Zone } from "@common/utils/enums/index";
import CharacterModel from "./character.model";
import { IHero, IHeroMethods, IHeroModel } from "@common/types/hero";
import { GameData } from "@common/utils/game/GameData";
import {
	BASE_REST_PRICE,
	BASE_RESTOCK_PRICE,
	EQUIPMENT_SLOT_TYPE_MAP,
	EXPERIENCE_MAP,
	MAX_POTIONS,
	POTION_PRICE,
	SHOP_ITEMS,
	SHOP_LEVEL,
	SKILL_LEVEL_MAP,
} from "@common/utils";
import { Game } from "@common/utils/game/Game";
import { IBattle, IBattleMethods } from "@common/types/battle";
import mongooseAutoPopulate from "mongoose-autopopulate";

const heroSchema = new Schema<IHero, IHeroModel, IHeroMethods>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		characterClassID: {
			type: String,
			required: [true, "Please choose a class"],
		},
		state: {
			type: String,
			enum: State,
			default: State.Idle,
		},
		maxBattleLevel: {
			type: Number,
			default: 0,
		},
		experience: {
			type: Number,
			min: 0,
			default: 0,
		},
		gold: {
			type: Number,
			min: 0,
			default: 0,
		},
		day: {
			type: Number,
			min: 1,
			default: 1,
		},
		kills: {
			type: Number,
			min: 0,
			default: 0,
		},
		slainBy: {
			type: String,
		},
		availableItemIDs: {
			type: [String],
			required: true,
		},
		restockCount: {
			type: Number,
			default: 0,
		},
		levelUp: {
			level: {
				type: Number,
			},
			skills: {
				type: [String],
			},
		},
	},
	{ timestamps: true, toJSON: { virtuals: true } },
);

heroSchema.virtual("availableItems").get(function () {
	return GameData.populateAvailableItems(this.availableItemIDs);
});

heroSchema.virtual("characterClass").get(function () {
	return GameData.populateClass(this.characterClassID);
});

heroSchema.virtual("currentLevelExperience").get(function () {
	return EXPERIENCE_MAP.get(this.level);
});

heroSchema.virtual("nextLevelExperience").get(function () {
	return EXPERIENCE_MAP.get(this.level + 1);
});

heroSchema.virtual("levelUpData").get(function () {
	if (this.levelUp && this.levelUp.level) {
		return {
			...this.levelUp,
			skills: GameData.populateSkillsFromID(this.levelUp.skills),
		};
	}
});

heroSchema.virtual("discountMultiplier").get(function () {
	return Math.round(1 - Game.getModifier(this.stats.charisma) / 10);
});

heroSchema.virtual("restockPrice").get(function () {
	return Math.round(BASE_RESTOCK_PRICE * Math.pow(2, this.restockCount) * this.discountMultiplier);
});

heroSchema.virtual("restPrice").get(function () {
	return Math.round(BASE_REST_PRICE * Math.pow(2, this.day - 1) * this.discountMultiplier);
});

heroSchema.virtual("startingBattleLevel").get(function () {
	return Math.floor(this.maxBattleLevel / 10) * 10 + 1;
});

heroSchema.method("addExperience", function addExperience(xp: number) {
	this.experience += xp;
	this.checkLevelUp();
});

heroSchema.method("addLevel", function addLevel(stat: Stat, skill?: string) {
	if (!this.levelUp) {
		throw new Error("No level up available");
	}
	if (this.baseStats[stat] + 1 > 25) {
		throw new Error("Attribute is already at maximum level");
	}
	if (skill && this.levelUp.skills.includes(skill)) {
		const skillData = GameData.getSkillById(skill);
		this.skillIDs.push({ id: skill, remaining: skillData.maxUses });
	}
	this.level++;
	this.baseStats[stat]++;

	const hitPoints = Game.d10;
	this.baseMaxHitPoints += hitPoints;
	this.baseHitPoints = this.baseMaxHitPoints;
	this.set("levelUp", undefined);
	this.checkLevelUp();
});

heroSchema.method("rest", function rest() {
	this.day++;
	this.restock();
	this.restockCount = 0;
	this.setHitPoints(this.baseMaxHitPoints);
	this.skillIDs.forEach((skill) => {
		const skillData = this.skills.find((sk) => sk.id === skill.id);
		return (skill.remaining = skillData.maxUses);
	});
});

heroSchema.method("restock", function restock() {
	this.set("availableItemIDs", GameData.getWeightedItems(this.characterClassID, SHOP_ITEMS, SHOP_LEVEL));
});

heroSchema.method("buyItem", function buyItem(id: string) {
	const item = this.availableItems.find((it) => it.id === id);

	if (!item) {
		throw new Error("Item is not available");
	}

	const price = Math.round(item.price * this.discountMultiplier);

	if (price > this.gold) {
		throw new Error("Not enough gold");
	}

	this.gold = this.gold - price;
	this.set(
		"availableItemIDs",
		this.availableItemIDs.filter((it) => it !== id),
	);
});

heroSchema.method("checkItem", function checkItem(id: string, slot: EquipmentSlot) {
	const item = GameData.getEquipmentById(id);

	if (!item) {
		throw new Error("Item not found");
	}

	const { armourTypes, weaponTypes } = this.characterClass;

	let validArmourType,
		validWeaponType = true;
	if ([EquipmentType.Armour, EquipmentType.Weapon].includes(item.type)) {
		validArmourType = "armourType" in item && armourTypes.includes(item.armourType);
		validWeaponType = "weaponType" in item && weaponTypes.includes(item.weaponType);
	}

	if (!validArmourType && !validWeaponType) {
		throw new Error("Class cannot use this item");
	}

	const slotTypes = EQUIPMENT_SLOT_TYPE_MAP.get(item.type as EquipmentType);
	if (!slotTypes.includes(slot)) {
		throw new Error("Item cannot be equipped to this slot");
	}
});

heroSchema.method("equipItem", function equipItem(id: string, slot: EquipmentSlot) {
	const item = GameData.getEquipmentById(id);

	if (!item) {
		throw new Error("Item not found");
	}

	const isTwoHandedWeapon = "size" in item && item.size === WeaponSize.TwoHanded;
	const offHand = isTwoHandedWeapon ? null : this.equipmentIDs.hand2;

	this.equipmentIDs = {
		...this.equipmentIDs,
		[EquipmentSlot.Hand2]: offHand,
		[slot]: id,
	};

	this.checkConstitution();
});

heroSchema.method("buyPotion", function buyPotion() {
	if (this.potions >= MAX_POTIONS) {
		throw new Error("Potion limit reached");
	}

	const price = Math.round(POTION_PRICE * this.discountMultiplier);
	if (price > this.gold) {
		throw new Error("Not enough gold");
	}

	this.gold -= price;
	this.potions++;
});

heroSchema.method("battleWon", function battleWon(battle: IBattle & IBattleMethods) {
	const { level, reward } = battle;
	this.maxBattleLevel = Math.max(this.maxBattleLevel, level);
	this.addExperience(reward.experience);
	this.gold += reward.gold;
	this.kills++;
	this.set("activeStatusEffects", []);
	this.set("activeAuxiliaryEffects", []);
});

heroSchema.method("battleLost", function battleLost(name: string) {
	this.slainBy = name;
});

heroSchema.method("checkLevelUp", function checkLevelUp() {
	if (this.experience >= this.nextLevelExperience) {
		const level = this.level + 1;
		const skills = SKILL_LEVEL_MAP.get(level)
			? GameData.getLevelUpSkills(this.characterClassID, level, this.skillIDs)
			: [];
		this.levelUp = { level, skills: skills as Types.Array<string> };
	}
});

heroSchema.index({ user: 1, state: 1 });

heroSchema.plugin(mongooseAutoPopulate);

const HeroModel = CharacterModel.discriminator<IHero, IHeroModel>("Hero", heroSchema);

export { HeroModel };
export default HeroModel;
