import { IHero } from "common/types/character";
import { Character } from "@game/Character";
import { GameData } from "@game/GameData";
import { EquipmentSlot, EquipmentType, Stat, State, WeaponSize } from "@common/utils/enums";
import { EQUIPMENT_SLOT_TYPE_MAP, EXPERIENCE_MAP, SKILL_LEVEL_MAP } from "common/utils/constants";
import { IReward } from "common/types/battle";
import { Game } from "./Game";

export class Hero extends Character {
	constructor(public data: IHero) {
		super(data);
	}

	public get characterJSON() {
		return {
			...this.data,
			skills: this.skills,
			equipment: this.equipment,
			availableItems: this.availableItems,
			characterClass: this.characterClass,
			nextLevelExperience: this.nextLevelExperience,
			levelUp: this.levelUpData,
		};
	}

	public get availableItems() {
		return GameData.populateAvailableItems(this.data.availableItems);
	}

	public get characterClass() {
		return GameData.populateClass(this.data.characterClass);
	}

	public get restPrice() {
		return this.data.day * 100;
	}

	public get nextLevelExperience() {
		return EXPERIENCE_MAP.get(this.data.level + 1);
	}

	public get levelUpData() {
		if (this.data.levelUp) {
			return {
				...this.data.levelUp,
				skills: GameData.populateSkillsFromID(this.data.levelUp.skills),
			};
		}
	}

	public addExperience(xp: number) {
		this.data.experience += xp;
		this.levelUpCheck();
	}

	public rest() {
		if (this.restPrice > this.data.gold) {
			throw new Error("Not enough gold");
		}
		this.data.gold = this.data.gold - this.restPrice;
		this.data.day++;
		this.data.availableItems = GameData.getShopItems(this.data.characterClass, this.data.level);
		this.data.hitPoints = this.data.maxHitPoints;
		this.data.skills.forEach((skill) => {
			const skillData = this.skills.find((sk) => sk.id === skill.id);
			return (skill.remaining = skillData.maxUses);
		});
	}

	public buyItem(id: string, slot: EquipmentSlot) {
		const item = this.availableItems.find((it) => it.id === id);

		if (!item) {
			throw new Error("Item is not available");
		}

		if (item.price > this.data.gold) {
			throw new Error("Not enough gold");
		}

		const { armourTypes, weaponTypes } = this.characterClass;
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
		const offHand = isTwoHandedWeapon ? null : this.data.equipment.hand2;

		this.data.gold = this.data.gold - item.price;
		this.data.availableItems = this.data.availableItems.filter((it) => it !== id);
		this.data.equipment = {
			...this.data.equipment,
			[EquipmentSlot.Hand2]: offHand,
			[slot]: id,
		};
	}

	private levelUpCheck() {
		if (this.data.experience >= this.nextLevelExperience) {
			const level = this.data.level + 1;
			const skills = SKILL_LEVEL_MAP.get(level) ? GameData.getLevelUpSkills(this.data.characterClass, level) : [];
			this.data.levelUp = { level, skills };
		}
	}

	public levelUp(stat: Stat, skill?: string) {
		if (!this.data.levelUp) {
			throw new Error("No level up available");
		}
		if (this.data.stats[stat] + 1 > 25) {
			throw new Error("Attribute is already at maximum level");
		}
		if (skill && this.data.levelUp.skills.includes(skill)) {
			const skillData = GameData.getSkillById(skill);
			this.data.skills.push({ id: skill, remaining: skillData.maxUses });
		}
		this.data.level++;
		this.data.stats[stat]++;

		const hitPoints = Game.d10 + Game.getModifier(this.stats.constitution);
		this.data.maxHitPoints += hitPoints;
		this.data.hitPoints += hitPoints;
		delete this.data.levelUp;
		this.levelUpCheck();
	}

	public battleWon(reward: IReward) {
		this.addExperience(reward.experience);
		this.data.gold += reward.gold;
		this.data.kills++;
		this.data.activeStatusEffects = [];
		this.data.activeAuxiliaryEffects = [];
		this.data.state = State.Idle;
	}

	public battleLost(name: string) {
		this.data.slainBy = name;
	}
}
