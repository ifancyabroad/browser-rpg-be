import { AuxiliaryEffect, HitType, Stat, Target } from "@common/utils";
import { Schema } from "mongoose";

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

export const statusEffectSchema = new Schema({
	skill: {
		type: String,
		required: true,
	},
	target: {
		type: String,
		enum: Target,
		required: true,
	},
	properties: {
		type: [],
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
});

export const auxiliaryEffectSchema = new Schema({
	skill: {
		type: String,
		required: true,
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
});
