import { ICharacter } from "types/character";
import { DamageType, EffectType, EquipmentType, HitType, Stat, WeaponType } from "@utils/enums/index";
import { GameData } from "@game/GameData";
import { Game } from "@game/Game";
import { mapToArray } from "@utils/helpers";
import { TEquipment, TWeapon } from "types/gameData";
import { IAction } from "types/battle";
import { IDamageEffect, IHealEffect, IWeaponDamageEffect } from "types/effect";

export class Character {
	constructor(public data: ICharacter) {}

	private getEquipmentBonus(type: string) {
		return mapToArray(this.equipmentAsArray)
			.flatMap((item) => "properties" in item && item.properties)
			.filter((item) => item.name === type)
			.reduce((n, { value }) => n + value, 0);
	}

	private getAciveEffectBonus(type: string) {
		return 0;
	}

	private getAttribute(stat: Stat) {
		return this.data.stats[stat] + this.getEquipmentBonus(stat) + this.getAciveEffectBonus(stat);
	}

	private getDamageBonus(type: DamageType) {
		return this.getEquipmentBonus(type) + this.getAciveEffectBonus(type);
	}

	public get skills() {
		return GameData.populateSkills(this.data.skills);
	}

	public get equipment() {
		return GameData.populateEquipment(this.data.equipment);
	}

	public get availableItems() {
		return GameData.populateAvailableItems(this.data.availableItems);
	}

	public get characterClass() {
		return GameData.populateClass(this.data.characterClass);
	}

	public get equipmentAsArray() {
		return mapToArray(this.equipment) as TEquipment[];
	}

	public get weaponsAsArray() {
		return this.equipmentAsArray.filter((item) => item.type === EquipmentType.Weapon) as TWeapon[];
	}

	public get stats() {
		return {
			[Stat.Strength]: this.getAttribute(Stat.Strength),
			[Stat.Dexterity]: this.getAttribute(Stat.Dexterity),
			[Stat.Constitution]: this.getAttribute(Stat.Constitution),
			[Stat.Intelligence]: this.getAttribute(Stat.Intelligence),
			[Stat.Wisdom]: this.getAttribute(Stat.Wisdom),
			[Stat.Charisma]: this.getAttribute(Stat.Charisma),
		};
	}

	public get hitType() {
		const modifier = Game.getModifier(this.stats.dexterity);
		const roll = Game.d20 + modifier;
		if (roll >= 20) {
			return HitType.Crit;
		} else if (roll >= 10) {
			return HitType.Hit;
		} else {
			return HitType.Miss;
		}
	}

	private getWeaponDamage(weapon: TWeapon, effect: IWeaponDamageEffect) {
		const damage = Game.dx(weapon.min, weapon.max);
		const stat = Game.getWeaponStat(weapon.type as WeaponType);
		const modifier = Game.getModifier(this.stats[stat]);
		const bonusMultiplier = this.getDamageBonus(weapon.damageType as DamageType) / 100 + 1;
		return {
			target: effect.target,
			type: weapon.damageType,
			value: (damage + modifier) * effect.multiplier * bonusMultiplier,
			hitType: this.hitType,
		};
	}

	public handleWeaponDamage(effect: IWeaponDamageEffect) {
		return this.weaponsAsArray.map((weapon) => {
			return this.getWeaponDamage(weapon, effect);
		});
	}

	private getDamage(effect: IDamageEffect) {
		const damage = Game.dx(effect.min, effect.max);
		const bonusMultiplier = this.getDamageBonus(effect.damageType) / 100 + 1;
		return {
			target: effect.target,
			type: effect.damageType,
			value: damage * bonusMultiplier,
			hitType: HitType.Hit,
		};
	}

	public handleDamage(effect: IDamageEffect) {
		return this.getDamage(effect);
	}

	private getHeal(effect: IHealEffect) {
		const heal = Game.dx(effect.min, effect.max);
		return {
			target: effect.target,
			value: heal,
		};
	}

	public handleHeal(effect: IHealEffect) {
		return this.getHeal(effect);
	}

	public createAction(id: string) {
		const skill = this.skills.find((sk) => sk.id === id);

		if (!skill) {
			throw new Error("Skill is not available");
		}

		if (skill.remaining <= 0) {
			throw new Error("No uses remaining for this skill");
		}

		const action: IAction = {
			weaponDamage: [],
			damage: [],
			heal: [],
			status: [],
			auxiliary: [],
		};

		skill.effects.forEach((effect) => {
			switch (effect.type) {
				case EffectType.WeaponDamage:
					action.weaponDamage.push(this.handleWeaponDamage(effect as IWeaponDamageEffect));
					break;
				case EffectType.Damage:
					action.damage.push(this.handleDamage(effect as IDamageEffect));
					break;
				case EffectType.Heal:
					action.heal.push(this.handleHeal(effect as IHealEffect));
					break;
				case EffectType.Status:
					break;
				case EffectType.Auxiliary:
					break;
			}
		});

		return action;
	}
}
