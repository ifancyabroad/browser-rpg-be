import { AuxiliaryEffect, HitType, PropertyType, Stat, Target } from "@common/utils";
import { Schema } from "mongoose";

// Allow empty strings to pass `required` check
Schema.Types.String.checkRequired((v) => v != null);

export const damageSchema = new Schema({
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

export const healSchema = new Schema({
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

const propertySchema = new Schema({
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

export const statusEffectSchema = new Schema({
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

export const auxiliaryEffectSchema = new Schema({
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
