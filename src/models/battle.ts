import { ObjectId } from "mongodb";
import mongoose, { Schema } from "mongoose";
import { BattleState, Status } from "@utils/enums/index";

const turnSchema = new Schema({});

const skillSchema = new Schema({
	id: {
		type: String,
	},
	remaining: {
		type: Number,
		min: 0,
	},
});

const enemySchema = new Schema(
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
		skills: {
			type: [skillSchema],
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

const battleSchema = new Schema(
	{
		user: {
			type: ObjectId,
			ref: "User",
		},
		character: {
			type: ObjectId,
			ref: "Character",
		},
		enemy: {
			type: enemySchema,
			required: true,
		},
		turns: {
			type: [turnSchema],
		},
		state: {
			type: String,
			enum: BattleState,
			default: BattleState.Active,
		},
	},
	{ timestamps: true },
);

const BattleModel = mongoose.model("Battle", battleSchema);

export { BattleModel };
export default BattleModel;
