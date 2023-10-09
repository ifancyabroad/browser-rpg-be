import { ICharacter } from "@common/types/character";
import {
	AuxiliaryEffect,
	AuxiliaryStat,
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
import { TEquipment, TSkill, TWeapon } from "@common/types/gameData";
import { IAction, IAuxiliary, IDamage, IHeal, IStatus, ITurnData } from "@common/types/battle";
import { IAuxiliaryEffect, IDamageEffect, IHealEffect, IStatusEffect, IWeaponDamageEffect } from "@common/types/effect";

export class Character {
	constructor(public data: ICharacter) {}

	private getEquipmentDefence() {
		return mapToArray(this.equipmentAsArray)
			.map((item) => "defence" in item && item.defence)
			.reduce((n, value) => n + value, 0);
	}

	private getEquipmentBonus(type: PropertyType, name: string) {
		return mapToArray(this.equipmentAsArray)
			.flatMap((item) => ("properties" in item ? item.properties : []))
			.filter((property) => property.type === type && property.name === name)
			.reduce((n, { value }) => n + value, 0);
	}

	private getActiveEffectBonus(type: string, name: string) {
		return this.data.activeStatusEffects
			.flatMap((effect) => effect.properties)
			.filter((property) => property.type === type && property.name === name)
			.reduce((n, { value }) => n + value, 0);
	}

	private getAttribute(stat: Stat) {
		return (
			this.data.stats[stat] +
			this.getEquipmentBonus(PropertyType.Stat, stat) +
			this.getActiveEffectBonus(PropertyType.Stat, stat)
		);
	}

	private getDamageBonus(type: DamageType) {
		return this.getEquipmentBonus(PropertyType.Damage, type) + this.getActiveEffectBonus(PropertyType.Damage, type);
	}

	private getResistance(type: DamageType) {
		return (
			this.data.resistances[type] +
			this.getEquipmentBonus(PropertyType.Resistance, type) +
			this.getActiveEffectBonus(PropertyType.Resistance, type)
		);
	}

	private getAuxiliaryStat(type: AuxiliaryStat) {
		return (
			this.getEquipmentBonus(PropertyType.AuxiliaryStat, type) +
			this.getActiveEffectBonus(PropertyType.AuxiliaryStat, type)
		);
	}

	public get alive() {
		return this.hitPoints > 0;
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

	public get hitPoints() {
		const modifier = Game.getModifier(this.stats[Stat.Constitution]) * this.data.level;
		const multiplier = this.getAuxiliaryStat(AuxiliaryStat.HitPoints) / 100 + 1;
		return Math.round((this.data.hitPoints + modifier) * multiplier);
	}

	public setHitPoints(value: number) {
		this.data.hitPoints = value;
		if (!this.alive) {
			this.data.status = Status.Dead;
		}
	}

	public get maxHitPoints() {
		const modifier = Game.getModifier(this.stats[Stat.Constitution]) * this.data.level;
		const multiplier = this.getAuxiliaryStat(AuxiliaryStat.HitPoints) / 100 + 1;
		return Math.round((this.data.maxHitPoints + modifier) * multiplier);
	}

	public get defence() {
		const multiplier = this.getAuxiliaryStat(AuxiliaryStat.Defence) / 100 + 1;
		return Math.round(this.getEquipmentDefence() * multiplier);
	}

	public get hitBonus() {
		return this.getAuxiliaryStat(AuxiliaryStat.HitChance);
	}

	public get critBonus() {
		return this.getAuxiliaryStat(AuxiliaryStat.CritChance);
	}

	public get isStunned() {
		return this.data.activeAuxiliaryEffects.map((effect) => effect.effect).includes(AuxiliaryEffect.Stun);
	}

	public get isPoisoned() {
		return this.data.activeAuxiliaryEffects.map((effect) => effect.effect).includes(AuxiliaryEffect.Poison);
	}

	public get isDisarmed() {
		return this.data.activeAuxiliaryEffects.map((effect) => effect.effect).includes(AuxiliaryEffect.Disarm);
	}

	public get isBleeding() {
		return this.data.activeAuxiliaryEffects.map((effect) => effect.effect).includes(AuxiliaryEffect.Bleed);
	}

	public get hitType() {
		const modifier = Game.getModifier(this.stats.dexterity);
		const hitMultiplier = this.hitBonus / 100 + 1;
		const critMultiplier = this.critBonus / 100 + 1;
		const hitRoll = Math.round((Game.d20 + modifier) * hitMultiplier);
		const critRoll = Math.round((Game.d20 + modifier) * critMultiplier);
		if (hitRoll >= 10 && critRoll >= 20) {
			return HitType.Crit;
		} else if (hitRoll >= 10) {
			return HitType.Hit;
		} else {
			return HitType.Miss;
		}
	}

	private getUnarmedDamage(effect: IWeaponDamageEffect) {
		const damage = Game.d4;
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
		if (this.weaponsAsArray.length > 0 && !this.isDisarmed) {
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

	private getStatus(effect: IStatusEffect, skill: TSkill & { id: string }) {
		return {
			skill: {
				id: skill.id,
				name: skill.name,
				icon: skill.icon,
			},
			target: effect.target,
			properties: effect.properties,
			remaining: effect.duration,
			duration: effect.duration,
			saved: false,
			modifier: effect.modifier,
			difficulty: effect.difficulty,
		};
	}

	private getAuxiliary(effect: IAuxiliaryEffect, skill: TSkill & { id: string }) {
		return {
			skill: {
				id: skill.id,
				name: skill.name,
				icon: skill.icon,
			},
			target: effect.target,
			effect: effect.effect,
			remaining: effect.duration,
			duration: effect.duration,
			saved: false,
			modifier: effect.modifier,
			difficulty: effect.difficulty,
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

		const action: IAction = {
			skill: skill.name,
			self: data.self.data.name,
			enemy: data.enemy.data.name,
			weaponDamage: [],
			damage: [],
			heal: [],
			status: [],
			auxiliary: [],
			activeEffects: data.self.data.activeAuxiliaryEffects,
		};

		if (this.isStunned) {
			return action;
		}

		if (skill.maxUses > 0) {
			this.data.skills.find((sk) => sk.id === data.skill).remaining--;
		}

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
					action.status.push(this.getStatus(effect as IStatusEffect, skill));
					break;
				case EffectType.Auxiliary:
					action.auxiliary.push(this.getAuxiliary(effect as IAuxiliaryEffect, skill));
					break;
			}
		});

		return action;
	}

	public handleWeaponDamage(damage: IDamage) {
		const resistance = this.defence / 100;
		damage.value = Math.round(damage.value * (1 - resistance));
		if (this.isBleeding) {
			damage.value = Math.round(damage.value * 1.5);
		}
		return this.handleDamage(damage);
	}

	public handleDamage(damage: IDamage) {
		const resistance = this.getResistance(damage.type as DamageType) / 100;
		let value = Math.round(damage.value * (1 - resistance));
		if (damage.hitType === HitType.Crit) {
			value *= 2;
			this.setHitPoints(this.data.hitPoints - value);
		}
		if (damage.hitType === HitType.Hit) {
			this.setHitPoints(this.data.hitPoints - value);
		}
		if (damage.hitType === HitType.Miss) {
			value = 0;
		}
		return { ...damage, value };
	}

	public handleHeal(heal: IHeal) {
		const hitPoints = this.hitPoints + heal.value;
		if (hitPoints > this.maxHitPoints) {
			this.setHitPoints(this.data.maxHitPoints);
		} else {
			this.setHitPoints(this.data.hitPoints + heal.value);
		}
		return heal;
	}

	public handleStatus(status: IStatus) {
		if (status.modifier && status.difficulty) {
			const modifier = Game.getModifier(this.stats[status.modifier]);
			const roll = Game.d20 + modifier;
			status.saved = roll >= status.difficulty;
		}

		if (status.saved) {
			return status;
		}

		const existingStatusEffect = this.data.activeStatusEffects.find(({ skill }) => skill.id === status.skill.id);
		if (existingStatusEffect) {
			existingStatusEffect.remaining = existingStatusEffect.duration;
		} else {
			this.data.activeStatusEffects.push(status);
		}

		return status;
	}

	public handleAuxiliary(auxiliary: IAuxiliary) {
		if (auxiliary.modifier && auxiliary.difficulty) {
			const modifier = Game.getModifier(this.stats[auxiliary.modifier]);
			const roll = Game.d20 + modifier;
			auxiliary.saved = roll >= auxiliary.difficulty;
		}

		if (auxiliary.saved) {
			return auxiliary;
		}

		const existingAuxiliaryEffect = this.data.activeAuxiliaryEffects.find(
			({ skill }) => skill.id === auxiliary.skill.id,
		);
		if (existingAuxiliaryEffect) {
			existingAuxiliaryEffect.remaining = existingAuxiliaryEffect.duration;
		} else {
			this.data.activeAuxiliaryEffects.push(auxiliary);
		}

		return auxiliary;
	}

	public handleAction(action: IAction, target: Target) {
		action.weaponDamage = action.weaponDamage.map((effects) => {
			return effects.map((effect) => (effect.target === target ? this.handleWeaponDamage(effect) : effect));
		});
		action.damage = action.damage.map((effect) => (effect.target === target ? this.handleDamage(effect) : effect));
		action.heal = action.heal.map((effect) => (effect.target === target ? this.handleHeal(effect) : effect));
		action.status = action.status.map((effect) => (effect.target === target ? this.handleStatus(effect) : effect));
		action.auxiliary = action.auxiliary.map((effect) =>
			effect.target === target ? this.handleAuxiliary(effect) : effect,
		);
		return action;
	}

	public tickEffects(action: IAction) {
		if (this.isPoisoned) {
			const damage = Math.round(this.maxHitPoints / 8);
			this.setHitPoints(this.data.hitPoints - damage);
		}

		this.data.activeStatusEffects = this.data.activeStatusEffects
			.filter((effect) => effect.remaining > 0)
			.map((effect) => ({ ...effect, remaining: effect.remaining - 1 }));
		this.data.activeAuxiliaryEffects = this.data.activeAuxiliaryEffects
			.filter((effect) => effect.remaining > 0)
			.map((effect) => ({ ...effect, remaining: effect.remaining - 1 }));

		return action;
	}
}
