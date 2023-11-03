import { ObjectId } from "mongodb";
import { Model, Schema, Types, model } from "mongoose";
import { BattleState, Status } from "@common/utils/enums/index";
import {
	IActiveEffect,
	IAuxiliaryEffect,
	IDamageEffect,
	IHealEffect,
	IStatusEffect,
	activeEffectSchema,
	auxiliaryEffectSchema,
	damageSchema,
	healSchema,
	statusEffectSchema,
} from "./effects.model";
import { IEnemy, enemySchema } from "./enemy.model";

interface IAction {
	self: string;
	enemy: string;
	skill: string;
	weaponDamage: Types.DocumentArray<IDamageEffect>[];
	damage: Types.DocumentArray<IDamageEffect>;
	heal: Types.DocumentArray<IHealEffect>;
	status: Types.DocumentArray<IStatusEffect>;
	auxiliary: Types.DocumentArray<IAuxiliaryEffect>;
	activeEffects: Types.DocumentArray<IActiveEffect>;
}

const actionSchema = new Schema<IAction>({
	self: {
		type: String,
		required: true,
	},
	enemy: {
		type: String,
		required: true,
	},
	skill: {
		type: String,
		required: true,
	},
	weaponDamage: [[damageSchema]],
	damage: [damageSchema],
	heal: [healSchema],
	status: [statusEffectSchema],
	auxiliary: [auxiliaryEffectSchema],
	activeEffects: [activeEffectSchema],
});

interface IReward {
	gold: number;
	experience: number;
}

interface IBattle {
	user: Types.ObjectId;
	character: Types.ObjectId;
	enemy: IEnemy;
	turns: Types.DocumentArray<IAction>[];
	state: BattleState;
	reward: IReward;
}

const battleSchema = new Schema<IBattle, Model<IBattle>>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		character: {
			type: Schema.Types.ObjectId,
			ref: "Character",
		},
		enemy: {
			type: enemySchema,
			required: true,
		},
		turns: {
			type: [[actionSchema]],
		},
		state: {
			type: String,
			enum: BattleState,
			default: BattleState.Active,
		},
		reward: {
			gold: {
				type: Number,
			},
			experience: {
				type: Number,
			},
		},
	},
	{ timestamps: true },
);

const BattleModel = model<IBattle, Model<IBattle>>("Battle", battleSchema);

export { BattleModel };
export default BattleModel;
