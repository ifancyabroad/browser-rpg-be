import {
	IActiveAuxiliaryEffect,
	IAuxiliaryEffect,
	IDamageEffect,
	IHealEffect,
	IProperty,
	IStatusEffect,
} from "@common/types/effect";
import { AuxiliaryEffect, HitType, PropertyType, Stat, Target } from "@common/utils";
import { Model, Schema } from "mongoose";

// Allow empty strings to pass `required` check
Schema.Types.String.checkRequired((v) => v != null);

export const damageSchema = new Schema<IDamageEffect, Model<IDamageEffect>>(
	{
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
	},
	{ _id: false },
);

export const healSchema = new Schema<IHealEffect, Model<IHealEffect>>(
	{
		value: {
			type: Number,
			required: true,
		},
		target: {
			type: String,
			enum: Target,
			required: true,
		},
	},
	{ _id: false },
);

const propertySchema = new Schema<IProperty, Model<IProperty>>(
	{
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
	},
	{ _id: false },
);

export const statusEffectSchema = new Schema<IStatusEffect, Model<IStatusEffect>>(
	{
		source: {
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
	},
	{ _id: false },
);

export const auxiliaryEffectSchema = new Schema<IAuxiliaryEffect, Model<IAuxiliaryEffect>>(
	{
		source: {
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
	},
	{ _id: false },
);

export const activeEffectSchema = new Schema<IActiveAuxiliaryEffect, Model<IActiveAuxiliaryEffect>>(
	{
		effect: {
			type: String,
			enum: AuxiliaryEffect,
			required: true,
		},
		remaining: {
			type: Number,
			required: true,
		},
	},
	{ _id: false },
);
