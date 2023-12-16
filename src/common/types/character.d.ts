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
	IAuxiliaryEffectData,
	IDamageEffectData,
	IHealEffectData,
	ISkillDataWithID,
	ISkillDataWithRemaining,
	IStatusEffectData,
	IWeaponDamageEffectData,
	IWeaponDataWithID,
	TDamageTypes,
	TEquipment,
	TEquipmentDataWithID,
	TStats,
} from "./gameData";
import { IAction, ITurnData } from "./battle";

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

export interface ICharacterMethods {
	// Add virtuals here
	get alive(): boolean;
	get skills(): Types.DocumentArray<ISkillDataWithRemaining>;
	get stats(): TStats;
	get resistances(): TDamageTypes;
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
	getHitType(): HitType;
	setHitPoints(value: number): void;
	getUnarmedDamage(effect: IWeaponDamageEffectData): number;
	getWeaponDamage(weapon: IWeaponDataWithID, effect: IWeaponDamageEffectData): IDamageEffect;
	getWeaponsDamage(effect: IWeaponDamageEffectData): IDamageEffect[];
	getDamage(effect: IDamageEffectData): IDamageEffect;
	getHeal(effect: IHealEffectData): IHealEffect;
	getStatus(effect: IStatusEffectData, skill: ISkillDataWithID): IStatusEffect;
	getAuxiliary(effect: IAuxiliaryEffectData, skill: ISkillDataWithID): IAuxiliaryEffect;
	createAction(data: ITurnData): IAction;
	handleWeaponDamage(damage: IDamageEffect): IDamageEffect;
	handleDamage(damage: IDamageEffect): IDamageEffect;
	handleHeal(heal: IHealEffect): IHealEffect;
	handleStatus(status: IStatusEffect): IStatusEffect;
	handleAuxiliary(auxiliary: IAuxiliaryEffect): IAuxiliaryEffect;
	handleAction(action: IAction, target: Target): IAction;
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
