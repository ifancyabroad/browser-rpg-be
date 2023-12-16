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
	const gold = GOLD_MULTIPLIER * (enemy.level + enemy.challenge);
	const experience = EXPERIENCE_MULTIPLIER * (enemy.level + enemy.challenge);
	this.reward = { gold: gold * hero.goldMultiplier, experience };
});

const BattleModel = model<IBattle, IBattleModel>("Battle", battleSchema);

export { BattleModel };
export default BattleModel;
