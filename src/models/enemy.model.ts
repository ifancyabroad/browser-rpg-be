import { DamageType, EquipmentSlot, Stat, Status } from "@common/utils";
import { Model, Schema, Types } from "mongoose";
import { ISkill, skillSchema } from "./skill.model";
import { IActiveEffect, IStatusEffect, activeEffectSchema, statusEffectSchema } from "./effects.model";

export interface IEnemy {
	id: string;
	name: string;
	image: string;
	status: Status;
	level: number;
	challenge: number;
	skills: Types.DocumentArray<ISkill>;
	activeStatusEffects: Types.DocumentArray<IStatusEffect>;
	activeAuxiliaryEffects: Types.DocumentArray<IActiveEffect>;
	equipment: Record<EquipmentSlot, string | null>;
	hitPoints: number;
	maxHitPoints: number;
	stats: Record<Stat, number>;
	resistances: Record<DamageType, number>;
}

// Add methods here
interface IEnemyMethods {
	// fullName(): string;
}

// Add static methods here
interface IEnemyModel extends Model<IEnemy, {}, IEnemyMethods> {
	// createWithFullName(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}

export const enemySchema = new Schema<IEnemy, IEnemyModel, IEnemyMethods>(
	{
		id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: Status,
			default: Status.Alive,
		},
		level: {
			type: Number,
			min: 1,
			max: 30,
			default: 1,
		},
		challenge: {
			type: Number,
			min: 1,
			max: 30,
			required: true,
		},
		skills: {
			type: [skillSchema],
		},
		activeStatusEffects: {
			type: [statusEffectSchema],
		},
		activeAuxiliaryEffects: {
			type: [activeEffectSchema],
		},
		equipment: {
			head: {
				type: String,
				default: null,
			},
			neck: {
				type: String,
				default: null,
			},
			body: {
				type: String,
				default: null,
			},
			waist: {
				type: String,
				default: null,
			},
			hands: {
				type: String,
				default: null,
			},
			feet: {
				type: String,
				default: null,
			},
			finger1: {
				type: String,
				default: null,
			},
			finger2: {
				type: String,
				default: null,
			},
			hand1: {
				type: String,
				default: null,
			},
			hand2: {
				type: String,
				default: null,
			},
		},
		hitPoints: {
			type: Number,
			required: true,
		},
		maxHitPoints: {
			type: Number,
			required: true,
		},
		stats: {
			strength: {
				type: Number,
				min: 1,
				max: 30,
				required: true,
			},
			dexterity: {
				type: Number,
				min: 1,
				max: 30,
				required: true,
			},
			constitution: {
				type: Number,
				min: 1,
				max: 30,
				required: true,
			},
			intelligence: {
				type: Number,
				min: 1,
				max: 30,
				required: true,
			},
			wisdom: {
				type: Number,
				min: 1,
				max: 30,
				required: true,
			},
			charisma: {
				type: Number,
				min: 1,
				max: 30,
				required: true,
			},
		},
		resistances: {
			slashing: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			crushing: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			piercing: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			cold: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			fire: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			lightning: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			radiant: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			necrotic: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			poison: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			acid: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
		},
	},
	{ timestamps: true },
);
