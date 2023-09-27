import { AuxiliaryEffect, DamageType, EffectType, Target } from "@utils/enums";
import { TProperty } from "./property";

export interface IWeaponDamageEffect {
	type: EffectType.WeaponDamage;
	target: Target;
	multiplier: number;
}

export interface IDamageEffect {
	type: EffectType.Damage;
	target: Target;
	damageType: DamageType;
	min: number;
	max: number;
}

export interface IHealEffect {
	type: EffectType.Heal;
	target: Target;
	min: number;
	max: number;
}

export interface IStatusEffect {
	type: EffectType.Status;
	target: Target;
	accuracy: number;
	duration: number;
	properties?: TProperty[];
}

export interface IAuxiliaryEffect {
	type: EffectType.Auxiliary;
	target: Target;
	effect: AuxiliaryEffect;
	accuracy: number;
	duration: number;
}

export type ISkillEffect = IWeaponDamageEffect | IDamageEffect | IHealEffect | IStatusEffect | IAuxiliaryEffect;

export type IWeaponEffect = IDamageEffect | IStatusEffect | IAuxiliaryEffect;
