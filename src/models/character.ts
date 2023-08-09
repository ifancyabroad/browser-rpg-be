import { ObjectId } from "mongodb";
import mongoose, { Schema } from "mongoose";
import { CharacterClass, State, Status } from "enums";

const skillSchema = new Schema({
	skill: {
		type: String,
	},
	remaining: {
		type: Number,
		min: 0,
	},
});

const historySchema = new Schema({
	enemy: {
		type: String,
	},
	level: {
		type: Number,
		min: 1,
	},
	day: {
		type: Number,
		min: 1,
	},
	defeated: {
		type: Boolean,
	},
});

const characterSchema = new Schema(
	{
		user: {
			type: ObjectId,
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
			enum: CharacterClass,
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
			max: 10000,
			default: 0,
		},
		day: {
			type: Number,
			min: 1,
			default: 1,
		},
		skills: {
			type: [skillSchema],
		},
		history: {
			type: [historySchema],
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
	},
	{ timestamps: true },
);

const CharacterModel = mongoose.model("Character", characterSchema);

export { CharacterModel };
export default CharacterModel;
