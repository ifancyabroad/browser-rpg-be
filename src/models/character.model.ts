import { Model, Schema, Types } from "mongoose";
import { DamageType, EquipmentSlot, Stat, State, Status } from "@common/utils/enums/index";
import { IActiveEffect, IStatusEffect, activeEffectSchema, statusEffectSchema } from "./effects.model";
import { model } from "mongoose";
import { ISkill, skillSchema } from "./skill.model";

interface ILevelUp {
	level: number;
	skills: Types.Array<string>;
}

interface ICharacter {
	user: Types.ObjectId;
	name: string;
	characterClass: string;
	status: Status;
	state: State;
	experience: number;
	level: number;
	gold: number;
	day: number;
	kills: number;
	skills: Types.DocumentArray<ISkill>;
	availableItems: Types.Array<string>;
	activeStatusEffects: Types.DocumentArray<IStatusEffect>;
	activeAuxiliaryEffects: Types.DocumentArray<IActiveEffect>;
	equipment: Record<EquipmentSlot, string | null>;
	hitPoints: number;
	maxHitPoints: number;
	stats: Record<Stat, number>;
	resistances: Record<DamageType, number>;
	levelUp?: ILevelUp;
	slainBy?: string;
}

// Add methods here
interface ICharacterMethods {
	// fullName(): string;
}

// Add static methods here
interface ICharacterModel extends Model<ICharacter, {}, ICharacterMethods> {
	// createWithFullName(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}

const characterSchema = new Schema<ICharacter, ICharacterModel, ICharacterMethods>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		name: {
			type: String,
			required: [true, "Please enter a name"],
			trim: true,
			minLength: 3,
			maxLength: 10,
		},
		characterClass: {
			type: String,
			required: [true, "Please choose a class"],
		},
		status: {
			type: String,
			enum: Status,
			default: Status.Alive,
		},
		state: {
			type: String,
			enum: State,
			default: State.Idle,
		},
		experience: {
			type: Number,
			min: 0,
			default: 0,
		},
		level: {
			type: Number,
			min: 1,
			max: 30,
			default: 1,
		},
		gold: {
			type: Number,
			min: 0,
			default: 0,
		},
		day: {
			type: Number,
			min: 1,
			default: 1,
		},
		kills: {
			type: Number,
			min: 0,
			default: 0,
		},
		slainBy: {
			type: String,
		},
		skills: {
			type: [skillSchema],
		},
		availableItems: {
			type: [String],
			required: true,
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
		levelUp: {
			level: {
				type: Number,
			},
			skills: {
				type: [String],
			},
		},
	},
	{ timestamps: true },
);

const CharacterModel = model<ICharacter, ICharacterModel>("Character", characterSchema);

export { CharacterModel };
export default CharacterModel;
