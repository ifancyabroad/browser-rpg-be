import { Schema, Types } from "mongoose";
import { EquipmentSlot, EquipmentType, Stat, State, WeaponSize } from "@common/utils/enums/index";
import CharacterModel from "./character.model";
import { IHero, IHeroMethods, IHeroModel } from "@common/types/hero";
import { GameData } from "@common/utils/game/GameData";
import { EQUIPMENT_SLOT_TYPE_MAP, EXPERIENCE_MAP, SKILL_LEVEL_MAP } from "@common/utils";
import { Game } from "@common/utils/game/Game";
import { IReward } from "@common/types/enemy";

const heroSchema = new Schema<IHero, IHeroModel, IHeroMethods>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		characterClass: {
			type: String,
			required: [true, "Please choose a class"],
		},
		state: {
			type: String,
			enum: State,
			default: State.Idle,
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
		availableItems: {
			type: [String],
			required: true,
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
	{ timestamps: true },
);

heroSchema.virtual("vAvailableItems").get(function () {
	return GameData.populateAvailableItems(this.availableItems);
});

heroSchema.virtual("vCharacterClass").get(function () {
	return GameData.populateClass(this.characterClass);
});

heroSchema.virtual("vRestPrice").get(function () {
	return this.day * 100;
});

heroSchema.virtual("vNextLevelExperience").get(function () {
	return EXPERIENCE_MAP.get(this.level + 1);
});

heroSchema.virtual("vLevelUpData").get(function () {
	if (this.levelUp) {
		return {
			...this.levelUp,
			skills: GameData.populateSkillsFromID(this.levelUp.skills),
		};
	}
});

heroSchema.method("addExperience", function addExperience(xp: number) {
	this.experience += xp;
	this.checkLevelUp();
});

heroSchema.method("addLevel", function addLevel(stat: Stat, skill?: string) {
	if (!this.levelUp) {
		throw new Error("No level up available");
	}
	if (this.stats[stat] + 1 > 25) {
		throw new Error("Attribute is already at maximum level");
	}
	if (skill && this.levelUp.skills.includes(skill)) {
		const skillData = GameData.getSkillById(skill);
		this.skills.push({ id: skill, remaining: skillData.maxUses });
	}
	this.level++;
	this.stats[stat]++;

	const hitPoints = Game.d10;
	this.maxHitPoints += hitPoints;
	this.hitPoints += hitPoints;
	delete this.levelUp;
	this.checkLevelUp();
});

heroSchema.method("rest", function rest() {
	if (this.vRestPrice > this.gold) {
		throw new Error("Not enough gold");
	}
	this.gold = this.gold - this.vRestPrice;
	this.day++;
	this.set("availableItems", GameData.getShopItems(this.characterClass, this.level));
	this.setHitPoints(this.maxHitPoints);
	this.skills.forEach((skill) => {
		const skillData = this.vSkills.find((sk) => sk.id === skill.id);
		return (skill.remaining = skillData.maxUses);
	});
});

heroSchema.method("buyItem", function buyItem(id: string, slot: EquipmentSlot) {
	const item = this.vAvailableItems.find((it) => it.id === id);

	if (!item) {
		throw new Error("Item is not available");
	}

	if (item.price > this.gold) {
		throw new Error("Not enough gold");
	}

	const { armourTypes, weaponTypes } = this.vCharacterClass;
	const validArmourType = "armourType" in item && armourTypes.includes(item.armourType);
	const validWeaponType = "weaponType" in item && weaponTypes.includes(item.weaponType);
	if (!validArmourType && !validWeaponType) {
		throw new Error("Class cannot use this item");
	}

	const slotTypes = EQUIPMENT_SLOT_TYPE_MAP.get(item.type as EquipmentType);
	if (!slotTypes.includes(slot)) {
		throw new Error("Item cannot be equipped to this slot");
	}

	const isTwoHandedWeapon = "size" in item && item.size === WeaponSize.TwoHanded;
	const offHand = isTwoHandedWeapon ? null : this.equipment.hand2;

	this.gold = this.gold - item.price;
	this.set(
		"availableItems",
		this.availableItems.filter((it) => it !== id),
	);
	this.equipment = {
		...this.equipment,
		[EquipmentSlot.Hand2]: offHand,
		[slot]: id,
	};

	this.checkConstitution();
});

heroSchema.method("battleWon", function battleWon(reward: IReward) {
	this.addExperience(reward.experience);
	this.gold += reward.gold;
	this.kills++;
	this.set("activeStatusEffects", []);
	this.set("activeAuxiliaryEffects", []);
	this.state = State.Idle;
});

heroSchema.method("battleLost", function battleLost(name: string) {
	this.slainBy = name;
});

heroSchema.method("checkLevelUp", function checkLevelUp() {
	if (this.experience >= this.vNextLevelExperience) {
		const level = this.level + 1;
		const skills = SKILL_LEVEL_MAP.get(level)
			? GameData.getLevelUpSkills(this.characterClass, level, this.skills)
			: [];
		this.levelUp = { level, skills: skills as Types.Array<string> };
	}
});

const HeroModel = CharacterModel.discriminator<IHero, IHeroModel>("Hero", heroSchema);

export { HeroModel };
export default HeroModel;
