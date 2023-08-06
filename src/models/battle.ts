import { ObjectId } from "mongodb";
import mongoose, { Schema } from "mongoose";
import { BattleState } from "src/enums";

const turnSchema = new Schema({});

const enemySchema = new Schema({});

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
