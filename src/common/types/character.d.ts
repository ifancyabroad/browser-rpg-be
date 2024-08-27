import { Request } from "express";
import {
	AuxiliaryStat,
	DamageType,
	EquipmentSlot,
	HitType,
	PropertyType,
	Stat,
	Status,
	Target,
} from "@common/utils/enums/index";
import { Model, Types } from "mongoose";
import { IActiveAuxiliaryEffect, IAuxiliaryEffect, IDamageEffect, IHealEffect, IStatusEffect } from "./effect";
import {
	ISkillDataWithID,
	ISkillDataWithRemaining,
	ISkillEffect,
	IWeaponDataWithID,
	TDamageTypes,
	TEquipment,
	TEquipmentDataWithID,
	TStats,
} from "./gameData";
import { IAction, ITurnData } from "./battle";
import { IZone } from "./hero";

export interface ISkill {
	id: string;
	remaining: number;
}

export interface ICharacter {
	name: string;
	status: Status;
	level: number;
	activeStatusEffects: Types.DocumentArray<IStatusEffect>;
	activeAuxiliaryEffects: Types.DocumentArray<IActiveAuxiliaryEffect>;
	skillIDs: Types.DocumentArray<ISkill>;
	equipmentIDs: TEquipment;
	baseHitPoints: number;
	baseMaxHitPoints: number;
	baseStats: TStats;
	baseResistances: TDamageTypes;
}

export interface IEffectData {
	effect: ISkillEffect;
	effectTarget: ICharacter & ICharacterMethods;
	skill: ISkillDataWithID;
}

export interface ICharacterMethods {
	// Add virtuals here
	get alive(): boolean;
	get skills(): Types.DocumentArray<ISkillDataWithRemaining>;
	get stats(): TStats;
	get resistances(): TDamageTypes;
	get damageBonuses(): TDamageTypes;
	get equipment(): Record<EquipmentSlot, TEquipmentDataWithID>;
	get equipmentAsArray(): TEquipmentDataWithID[];
	get weaponsAsArray(): IWeaponDataWithID[];
	get hitPoints(): number;
	get maxHitPoints(): number;
	get armourClass(): number;
	get hitBonus(): number;
	get critBonus(): number;
	get isStunned(): boolean;
	get isPoisoned(): boolean;
	get isDisarmed(): boolean;
	get isBleeding(): boolean;

	// Add methods here
	getEquipmentArmourClass(): number;
	getEquipmentBonus(type: PropertyType, name: string): number;
	getActiveEffectBonus(type: string, name: string): number;
	getAttribute(stat: Stat): number;
	getDamageBonus(type: DamageType): number;
	getResistance(type: DamageType): number;
	getAuxiliaryStat(type: AuxiliaryStat): number;
	getHitType(armourClass: number): HitType;
	setHitPoints(value: number): void;
	getUnarmedDamage(data: IEffectData): number;
	getWeaponDamage(data: IEffectData, weapon: IWeaponDataWithID): IDamageEffect;
	getWeaponsDamage(data: IEffectData): IDamageEffect[];
	getDamage(data: IEffectData): IDamageEffect;
	getHeal(data: IEffectData): IHealEffect;
	getStatus(data: IEffectData): IStatusEffect;
	getAuxiliary(data: IEffectData): IAuxiliaryEffect;
	createAction(data: ITurnData): IAction;
	handleDamage(damage: IDamageEffect): void;
	handleHeal(heal: IHealEffect): void;
	handleStatus(status: IStatusEffect): void;
	handleAuxiliary(auxiliary: IAuxiliaryEffect): void;
	handleAction(action: IAction, target: Target): void;
	tickPoison(): void;
	tickEffects(): void;

	checkAlive(): void;
	checkConstitution(): void;
}

// Add static methods here
export interface ICharacterModel extends Model<ICharacter, {}, ICharacterMethods> {
	// createWithFullName(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}

export interface ICharacterInput {
	id?: string;
	name: string;
	characterClass: string;
}

export interface RequestCharacter extends Request {
	character?: ICharacterInput;
}

export interface IBuyItemInput {
	id: string;
	slot: EquipmentSlot;
}

export interface RequestItem extends Request {
	item: IBuyItemInput;
}

export interface ILevelUpInput {
	stat: Stat;
	skill?: string;
}

export interface RequestLevelUp extends Request {
	levelUp: ILevelUpInput;
}

export interface ITreasureInput {
	id?: string;
	slot?: EquipmentSlot;
	zone: IZone;
}

export interface RequestTreasure extends Request {
	item: ITreasureInput;
}

export interface RequestZone extends Request {
	zone: IZone;
}
