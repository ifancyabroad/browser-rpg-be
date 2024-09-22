import { AuxiliaryEffect, HitType, PropertyType, Stat, Target } from "@common/utils/enums";
import { Types } from "mongoose";

export interface IDamageEffect {
	type: string;
	value: number;
	hitType: HitType;
	target: Target;
}

export interface IHealEffect {
	value: number;
	target: Target;
}

export interface IProperty {
	type: PropertyType;
	name: string;
	value: number;
}

export interface IEffectSource {
	id: string;
	name: string;
	icon: string;
}

export interface IStatusEffect {
	source: IEffectSource;
	target: Target;
	properties: Types.DocumentArray<IProperty>;
	remaining: number;
	duration: number;
	modifier: Stat;
	difficulty: number;
	saved: boolean;
}

export interface IAuxiliaryEffect {
	source: IEffectSource;
	target: Target;
	effect: AuxiliaryEffect;
	remaining: number;
	duration: number;
	modifier: Stat;
	difficulty: number;
	saved: boolean;
}

export interface IActiveAuxiliaryEffect {
	effect: AuxiliaryEffect;
	remaining: number;
}
