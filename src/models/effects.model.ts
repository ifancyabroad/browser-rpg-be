import { AuxiliaryEffect, HitType, PropertyType, Stat, Target } from "@common/utils";
import { Model, Schema, Types } from "mongoose";

// Allow empty strings to pass `required` check
Schema.Types.String.checkRequired((v) => v != null);

export interface IDamageEffect {
	type: string;
	value: number;
	hitType: HitType;
	target: Target;
}

export const damageSchema = new Schema<IDamageEffect, Model<IDamageEffect>>({
	type: {
		type: String,
		required: true,
	},
	value: {
		type: Number,
		required: true,
	},
	hitType: {
		type: String,
		enum: HitType,
		required: true,
	},
	target: {
		type: String,
		enum: Target,
		required: true,
	},
});

export interface IHealEffect {
	value: number;
	target: Target;
}

export const healSchema = new Schema<IHealEffect, Model<IHealEffect>>({
	value: {
		type: Number,
		required: true,
	},
	target: {
		type: String,
		enum: Target,
		required: true,
	},
});

export interface IProperty {
	type: PropertyType;
	name: string;
	value: number;
}

const propertySchema = new Schema<IProperty, Model<IProperty>>({
	type: {
		type: String,
		enum: PropertyType,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	value: {
		type: Number,
		required: true,
	},
});

export interface IStatusEffectSkill {
	id: string;
	name: string;
	icon: string;
}

export interface IStatusEffect {
	skill: IStatusEffectSkill;
	target: Target;
	properties: Types.DocumentArray<IProperty>;
	remaining: number;
	duration: number;
	modifier: Stat;
	difficulty: number;
	saved: boolean;
}

export const statusEffectSchema = new Schema<IStatusEffect, Model<IStatusEffect>>({
	skill: {
		id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		icon: {
			type: String,
			required: true,
		},
	},
	target: {
		type: String,
		enum: Target,
		required: true,
	},
	properties: {
		type: [propertySchema],
	},
	remaining: {
		type: Number,
		required: true,
	},
	duration: {
		type: Number,
		required: true,
	},
	modifier: {
		type: String,
		enum: Stat,
	},
	difficulty: {
		type: Number,
	},
	saved: {
		type: Boolean,
		required: true,
	},
});

export interface IAuxiliaryEffect {
	skill: IStatusEffectSkill;
	target: Target;
	effect: AuxiliaryEffect;
	remaining: number;
	duration: number;
	modifier: Stat;
	difficulty: number;
	saved: boolean;
}

export const auxiliaryEffectSchema = new Schema<IAuxiliaryEffect, Model<IAuxiliaryEffect>>({
	skill: {
		id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		icon: {
			type: String,
			required: true,
		},
	},
	target: {
		type: String,
		enum: Target,
		required: true,
	},
	effect: {
		type: String,
		enum: AuxiliaryEffect,
		required: true,
	},
	remaining: {
		type: Number,
		required: true,
	},
	duration: {
		type: Number,
		required: true,
	},
	modifier: {
		type: String,
		enum: Stat,
	},
	difficulty: {
		type: Number,
	},
	saved: {
		type: Boolean,
		required: true,
	},
});

export interface IActiveEffect {
	effect: AuxiliaryEffect;
	remaining: number;
}

export const activeEffectSchema = new Schema<IActiveEffect, Model<IActiveEffect>>({
	effect: {
		type: String,
		enum: AuxiliaryEffect,
		required: true,
	},
	remaining: {
		type: Number,
		required: true,
	},
});
