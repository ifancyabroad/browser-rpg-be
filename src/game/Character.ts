import { ICharacter } from "@common/types/character";
import {
	DamageType,
	EffectType,
	EquipmentType,
	HitType,
	PropertyType,
	Stat,
	Status,
	Target,
	WeaponType,
} from "@common/utils/enums/index";
import { GameData } from "@game/GameData";
import { Game } from "@game/Game";
import { mapToArray } from "@common/utils/helpers";
import { TEquipment, TWeapon } from "@common/types/gameData";
import { IAction, IDamage, IHeal, ITurnData } from "@common/types/battle";
import { IDamageEffect, IHealEffect, IStatusEffect, IWeaponDamageEffect } from "@common/types/effect";

export class Character {
	constructor(public data: ICharacter) {}

	private getEquipmentBonus(type: PropertyType, name: string) {
		return mapToArray(this.equipmentAsArray)
			.flatMap((item) => ("properties" in item ? item.properties : []))
			.filter((property) => property.type === type && property.name === name)
			.reduce((n, { value }) => n + value, 0);
	}

	private getAciveEffectBonus(type: string, name: string) {
		return 0;
	}

	private getAttribute(stat: Stat) {
		return (
			this.data.stats[stat] +
			this.getEquipmentBonus(PropertyType.Stat, stat) +
			this.getAciveEffectBonus(PropertyType.Stat, stat)
		);
	}

	private getDamageBonus(type: DamageType) {
		return this.getEquipmentBonus(PropertyType.Damage, type) + this.getAciveEffectBonus(PropertyType.Damage, type);
	}

	private getResistance(type: DamageType) {
		return (
			this.data.resistances[type] +
			this.getEquipmentBonus(PropertyType.Resistance, type) +
			this.getAciveEffectBonus(PropertyType.Resistance, type)
		);
	}

	public get alive() {
		return this.data.hitPoints > 0;
	}

	public get skills() {
		return GameData.populateSkills(this.data.skills);
	}

	public get equipment() {
		return GameData.populateEquipment(this.data.equipment);
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

	private getUnarmedDamage(effect: IWeaponDamageEffect) {
		const damage = Game.dx(1, 4);
		const modifier = Game.getModifier(this.stats.strength);
		const bonusMultiplier = this.getDamageBonus(DamageType.Crushing) / 100 + 1;
		return {
			target: effect.target,
			type: DamageType.Crushing,
			value: (damage + modifier) * effect.multiplier * bonusMultiplier,
			hitType: this.hitType,
		};
	}

	private getWeaponDamage(weapon: TWeapon, effect: IWeaponDamageEffect) {
		const damage = Game.dx(weapon.min, weapon.max);
		const stat = Game.getWeaponStat(weapon.weaponType as WeaponType);
		const modifier = Game.getModifier(this.stats[stat]);
		const bonusMultiplier = this.getDamageBonus(weapon.damageType as DamageType) / 100 + 1;
		const value = Math.round((damage + modifier) * effect.multiplier * bonusMultiplier);
		return {
			target: effect.target,
			type: weapon.damageType,
			value,
			hitType: this.hitType,
		};
	}

	public getWeaponsDamage(effect: IWeaponDamageEffect) {
		if (this.weaponsAsArray.length > 0) {
			return this.weaponsAsArray.map((weapon) => {
				return this.getWeaponDamage(weapon, effect);
			});
		}
		return [this.getUnarmedDamage(effect)];
	}

	private getDamage(effect: IDamageEffect) {
		const damage = Game.dx(effect.min, effect.max);
		const bonusMultiplier = this.getDamageBonus(effect.damageType) / 100 + 1;
		const value = Math.round(damage * bonusMultiplier);
		return {
			target: effect.target,
			type: effect.damageType,
			value,
			hitType: HitType.Hit,
		};
	}

	private getHeal(effect: IHealEffect) {
		const heal = Game.dx(effect.min, effect.max);
		return {
			target: effect.target,
			value: heal,
		};
	}

	private getStatus(effect: IStatusEffect) {
		return {
			target: effect.target,
			properties: effect.properties,
			remaining: effect.duration,
		};
	}

	public createAction(data: ITurnData) {
		const skill = this.skills.find((sk) => sk.id === data.skill);

		if (!skill) {
			throw new Error("Skill is not available");
		}

		if (skill.maxUses > 0 && skill.remaining <= 0) {
			throw new Error("No uses remaining for this skill");
		}

		if (skill.maxUses > 0) {
			this.data.skills.find((sk) => sk.id === data.skill).remaining--;
		}

		const action: IAction = {
			skill: skill.name,
			self: data.self.data.name,
			enemy: data.enemy.data.name,
			weaponDamage: [],
			damage: [],
			heal: [],
			status: [],
			auxiliary: [],
		};

		skill.effects.forEach((effect) => {
			switch (effect.type) {
				case EffectType.WeaponDamage:
					action.weaponDamage.push(this.getWeaponsDamage(effect as IWeaponDamageEffect));
					break;
				case EffectType.Damage:
					action.damage.push(this.getDamage(effect as IDamageEffect));
					break;
				case EffectType.Heal:
					action.heal.push(this.getHeal(effect as IHealEffect));
					break;
				case EffectType.Status:
					action.status.push(this.getStatus(effect as IStatusEffect));
					break;
				case EffectType.Auxiliary:
					break;
			}
		});

		return action;
	}

	public handleDamage(damage: IDamage) {
		const resistance = this.getResistance(damage.type as DamageType) / 100;
		let value = Math.round(damage.value * (1 - resistance));
		if (damage.hitType === HitType.Crit) {
			value *= 2;
			this.data.hitPoints -= value;
		}
		if (damage.hitType === HitType.Hit) {
			this.data.hitPoints -= value;
		}
		if (damage.hitType === HitType.Miss) {
			value = 0;
		}
		if (!this.alive) {
			this.data.status = Status.Dead;
		}
		return { ...damage, value };
	}

	public handleHeal(heal: IHeal) {
		const hitPoints = this.data.hitPoints + heal.value;
		if (hitPoints > this.data.maxHitPoints) {
			this.data.hitPoints = this.data.maxHitPoints;
		} else {
			this.data.hitPoints = hitPoints;
		}
		return heal;
	}

	public handleAction(action: IAction, target: Target) {
		action.weaponDamage = action.weaponDamage.map((effects) => {
			return effects.map((effect) => (effect.target === target ? this.handleDamage(effect) : effect));
		});
		action.damage = action.damage.map((effect) => (effect.target === target ? this.handleDamage(effect) : effect));
		action.heal = action.heal.map((effect) => (effect.target === target ? this.handleHeal(effect) : effect));
		return action;
	}
}
