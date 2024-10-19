import { BattleResult, BattleState, EquipmentSlot, Zone } from "@common/utils/enums/index";
import { Request } from "express";
import { Model, Types } from "mongoose";
import { IActiveAuxiliaryEffect, IAuxiliaryEffect, IDamageEffect, IHealEffect, IStatusEffect } from "./effect";
import { ICharacter, ICharacterMethods } from "./character";
import { IHero, IHeroMethods } from "./hero";
import { IEnemy, IEnemyMethods } from "./enemy";
import { TEquipmentDataWithID } from "./gameData";

export interface IReward {
	gold: number;
	experience: number;
}

export interface IActionWeaponEffect {
	name: string;
	damage: Types.DocumentArray<IDamageEffect>;
	status: Types.DocumentArray<IStatusEffect>;
	auxiliary: Types.DocumentArray<IAuxiliaryEffect>;
}

export interface IActionSkillEffect {
	name: string;
	weaponDamage: Types.DocumentArray<IDamageEffect[]>;
	damage: Types.DocumentArray<IDamageEffect>;
	heal: Types.DocumentArray<IHealEffect>;
	status: Types.DocumentArray<IStatusEffect>;
	auxiliary: Types.DocumentArray<IAuxiliaryEffect>;
}

export interface IAction {
	self: string;
	enemy: string;
	skill: IActionSkillEffect;
	weapon: Types.DocumentArray<IActionWeaponEffect>;
	activeEffects: Types.DocumentArray<IActiveAuxiliaryEffect>;
}

export interface IBattle {
	user: Types.ObjectId;
	hero: Types.ObjectId;
	enemy: Types.ObjectId;
	level: number;
	multiplier: number;
	zone: Zone;
	turns: Types.DocumentArray<IAction[]>;
	state: BattleState;
	result?: BattleResult;
	reward?: IReward;
	treasureItemIDs: string[];
}

export interface IBattleMethods {
	// Add virtuals here
	get treasure(): TEquipmentDataWithID[];

	// Add methods here
	handleAction(first: ITurnData, second: ITurnData): IAction[];
	handleTurn(hero: ITurnData, enemy: ITurnData): IAction[];
	handleReward(hero: IHero & IHeroMethods, enemy: IEnemy & IEnemyMethods): void;
	handleTreasure(hero: IHero & IHeroMethods, enemy: IEnemy & IEnemyMethods): void;
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

export interface ITreasureInput {
	id?: string;
	slot?: EquipmentSlot;
}

export interface RequestTreasure extends Request {
	item: ITreasureInput;
}
