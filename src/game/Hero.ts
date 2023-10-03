import { IHero } from "types/character";
import { Character } from "@game/Character";
import { GameData } from "@game/GameData";
import { EquipmentSlot, EquipmentType, State, WeaponSize } from "@utils/enums";
import { EQUIPMENT_SLOT_TYPE_MAP, EXPERIENCE_MAP } from "@utils/constants";
import { IReward } from "types/battle";

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
		const experienceRequired = EXPERIENCE_MAP.get(this.data.level + 1);
		if (this.data.experience >= experienceRequired) {
			// TODO: level up logic
		}
	}

	public battleWon(reward: IReward) {
		this.data.kills++;
		this.data.experience += reward.experience;
		this.data.gold += reward.gold;
		this.data.state = State.Idle;
		this.levelUpCheck();
	}

	public battleLost(name: string) {
		this.data.slainBy = name;
	}
}
