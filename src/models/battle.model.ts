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
import { IHero, IHeroMethods } from "@common/types/hero";
import { IEnemy, IEnemyMethods } from "@common/types/enemy";
import { EXPERIENCE_MULTIPLIER, GOLD_MULTIPLIER } from "@common/utils";
import mongooseAutoPopulate from "mongoose-autopopulate";
import { locationSchema } from "./location.model";

const actionSchema = new Schema<IAction, Model<IAction>>(
	{
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
	},
	{ _id: false },
);

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
			autopopulate: true,
		},
		map: {
			type: Schema.Types.ObjectId,
			ref: "Map",
		},
		location: {
			type: locationSchema,
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
	{ timestamps: true, toJSON: { virtuals: true } },
);

battleSchema.method("handleAction", function handleAction(first: ITurnData, second: ITurnData) {
	const turn: IAction[] = [];
	[first, second].forEach((data) => {
		if (data.self.alive && data.enemy.alive) {
			const action = data.self.createAction(data);
			turn.push(action);
			data.self.handleAction(action, Target.Self);
			data.enemy.handleAction(action, Target.Enemy);
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

battleSchema.method("handleReward", function (hero: IHero & IHeroMethods, enemy: IEnemy & IEnemyMethods) {
	const gold = GOLD_MULTIPLIER * (enemy.level * enemy.rating);
	const experience = EXPERIENCE_MULTIPLIER * (enemy.level * enemy.rating);
	this.reward = { gold: gold * hero.goldMultiplier, experience };
});

battleSchema.index({ hero: 1, state: 1 });

battleSchema.plugin(mongooseAutoPopulate);

const BattleModel = model<IBattle, IBattleModel>("Battle", battleSchema);

export { BattleModel };
export default BattleModel;
