import { Model, Schema, model } from "mongoose";
import { AuxiliaryEffect, BattleResult, BattleState, DamageType, Target, Zone } from "@common/utils/enums/index";
import {
	activeEffectSchema,
	auxiliaryEffectSchema,
	damageSchema,
	healSchema,
	statusEffectSchema,
} from "./effects.model";
import {
	IAction,
	IActionSkillEffect,
	IActionWeaponEffect,
	IBattle,
	IBattleMethods,
	IBattleModel,
	ITurnData,
} from "@common/types/battle";
import { IHero, IHeroMethods } from "@common/types/hero";
import { IEnemy, IEnemyMethods } from "@common/types/enemy";
import { EXPERIENCE_MULTIPLIER, GameData, GOLD_MULTIPLIER } from "@common/utils";
import mongooseAutoPopulate from "mongoose-autopopulate";

const actionEffectSchema = new Schema<IActionSkillEffect, Model<IActionSkillEffect>>(
	{
		name: String,
		weaponDamage: [[damageSchema]],
		damage: [damageSchema],
		heal: [healSchema],
		status: [statusEffectSchema],
		auxiliary: [auxiliaryEffectSchema],
	},
	{ _id: false },
);

const weaponEffectSchema = new Schema<IActionWeaponEffect, Model<IActionWeaponEffect>>(
	{
		name: String,
		damage: [damageSchema],
		heal: [healSchema],
		status: [statusEffectSchema],
		auxiliary: [auxiliaryEffectSchema],
	},
	{ _id: false },
);

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
		skill: actionEffectSchema,
		weapon: [weaponEffectSchema],
		activeEffects: [activeEffectSchema],
	},
	{ _id: false },
);

const battleSchema = new Schema<IBattle, IBattleModel, IBattleMethods>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			index: true,
		},
		hero: {
			type: Schema.Types.ObjectId,
			ref: "Hero",
		},
		enemy: {
			type: Schema.Types.ObjectId,
			ref: "Enemy",
		},
		level: {
			type: Number,
			default: 1,
		},
		multiplier: {
			type: Number,
			default: 1,
		},
		zone: {
			type: String,
			enum: Zone,
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
		result: {
			type: String,
			enum: BattleResult,
		},
		reward: {
			gold: {
				type: Number,
			},
			experience: {
				type: Number,
			},
		},
		treasureItemIDs: {
			type: [String],
		},
	},
	{ timestamps: true, toJSON: { virtuals: true } },
);

battleSchema.virtual("treasure").get(function () {
	return GameData.populateAvailableItems(this.treasureItemIDs);
});

battleSchema.method("handleAction", function handleAction(first: ITurnData, second: ITurnData) {
	const turn: IAction[] = [];
	[first, second].forEach((data) => {
		if (data.self.alive && data.enemy.alive) {
			const action = data.self.createAction(data);
			turn.push(action);
			data.self.handleAction(action, Target.Self);
			data.enemy.handleAction(action, Target.Enemy);
			data.self.tickPoison(data.enemy.getDamageBonus(DamageType.Poison));
			data.self.tickEffects();
		}
	});
	return turn;
});

battleSchema.method("getTurnOrder", function (hero: ITurnData, enemy: ITurnData) {
	return [hero, enemy].sort((a, b) => {
		if (a.self.auxiliaryEffects[AuxiliaryEffect.Haste] !== b.self.auxiliaryEffects[AuxiliaryEffect.Haste]) {
			return a.self.auxiliaryEffects[AuxiliaryEffect.Haste] ? -1 : 1;
		}
		if (a.self.auxiliaryEffects[AuxiliaryEffect.Cripple] !== b.self.auxiliaryEffects[AuxiliaryEffect.Cripple]) {
			return a.self.auxiliaryEffects[AuxiliaryEffect.Cripple] ? 1 : -1;
		}
		return b.self.stats.dexterity - a.self.stats.dexterity;
	});
});

battleSchema.method("handleTurn", function (hero: ITurnData, enemy: ITurnData) {
	const [first, second] = this.getTurnOrder(hero, enemy);
	return this.handleAction(first, second);
});

battleSchema.method("handleReward", function (hero: IHero & IHeroMethods, enemy: IEnemy & IEnemyMethods) {
	const gold = Math.round(GOLD_MULTIPLIER * enemy.challenge * this.multiplier);
	const experience = Math.round(EXPERIENCE_MULTIPLIER * enemy.level * enemy.challenge);
	this.reward = { gold, experience };
});

battleSchema.method("handleTreasure", function (hero: IHero & IHeroMethods, enemy: IEnemy & IEnemyMethods) {
	if (enemy.boss || enemy.hero) {
		this.treasureItemIDs = GameData.getWeightedItems(hero.characterClassID, 2, enemy.level);
	}
});

battleSchema.index({ hero: 1, state: 1 });
battleSchema.index({ user: 1, state: 1, result: 1 });

battleSchema.plugin(mongooseAutoPopulate);

const BattleModel = model<IBattle, IBattleModel>("Battle", battleSchema);

export { BattleModel };
export default BattleModel;
