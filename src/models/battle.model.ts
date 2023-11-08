import { Model, Schema, model } from "mongoose";
import { BattleState, Target } from "@common/utils/enums/index";
import {
	activeEffectSchema,
	auxiliaryEffectSchema,
	damageSchema,
	healSchema,
	statusEffectSchema,
} from "./effects.model";
import { IAction, IBattle, IBattleMethods, IBattleModel, ITurnData } from "@common/types/battle";

const actionSchema = new Schema<IAction, Model<IAction>>({
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

const battleSchema = new Schema<IBattle, IBattleModel, IBattleMethods>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		hero: {
			type: Schema.Types.ObjectId,
			ref: "Hero",
		},
		enemy: {
			type: Schema.Types.ObjectId,
			ref: "Enemy",
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

battleSchema.method("handleAction", function handleAction(first: ITurnData, second: ITurnData) {
	const turn: IAction[] = [];
	[first, second].forEach((data) => {
		if (data.self.vAlive && data.enemy.vAlive) {
			const action = data.self.createAction(data);
			const actionSelf = data.self.handleAction(action, Target.Self);
			const actionEnemy = data.enemy.handleAction(actionSelf, Target.Enemy);
			turn.push(actionEnemy);

			data.self.tickPoison();
			data.self.tickEffects();
		}
	});
	return turn;
});

battleSchema.method("handleTurn", function (hero: ITurnData, enemy: ITurnData) {
	let turn: IAction[];

	if (hero.self.stats.dexterity >= enemy.self.stats.dexterity) {
		turn = this.handleAction(hero, enemy);
	} else {
		turn = this.handleAction(enemy, hero);
	}

	return turn;
});

const BattleModel = model<IBattle, IBattleModel>("Battle", battleSchema);

export { BattleModel };
export default BattleModel;
