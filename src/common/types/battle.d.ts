import { BattleState, Target } from "@common/utils/enums/index";
import { Request } from "express";
import { Model, Types } from "mongoose";
import { IReward } from "./enemy";
import { IActiveAuxiliaryEffect, IAuxiliaryEffect, IDamageEffect, IHealEffect, IStatusEffect } from "./effect";
import { ICharacter, ICharacterMethods, ICharacterModel } from "./character";

export interface IAction {
	self: string;
	enemy: string;
	skill: string;
	weaponDamage: Types.DocumentArray<IDamageEffect[]>;
	damage: Types.DocumentArray<IDamageEffect>;
	heal: Types.DocumentArray<IHealEffect>;
	status: Types.DocumentArray<IStatusEffect>;
	auxiliary: Types.DocumentArray<IAuxiliaryEffect>;
	activeEffects: Types.DocumentArray<IActiveAuxiliaryEffect>;
}

export interface IBattle {
	user: Types.ObjectId;
	hero: Types.ObjectId;
	enemy: Types.ObjectId;
	turns: Types.DocumentArray<IAction[]>;
	state: BattleState;
	reward?: IReward;
}

export interface IBattleMethods {
	// Add virtuals here

	// Add methods here
	handleAction(first: ITurnData, second: ITurnData): IAction[];
	handleTurn(hero: ITurnData, enemy: ITurnData): IAction[];
}

// Add static methods here
export interface IBattleModel extends Model<IBattle, {}, IBattleMethods> {
	// createWithFullName(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}

export interface IBattleInput {
	id: string;
}

export interface RequestAction extends Request {
	skill: IBattleInput;
}

export interface ITurnData {
	self: ICharacter & ICharacterMethods;
	enemy: ICharacter & ICharacterMethods;
	skill: string;
}
