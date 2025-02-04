import { Request } from "express";
import {
	AuxiliaryEffect,
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
import {
	IActiveAuxiliaryEffect,
	IAuxiliaryEffect,
	IDamageEffect,
	IEffectSource,
	IHealEffect,
	IStatusEffect,
} from "./effect";
import {
	ISkillDataWithRemaining,
	ISkillEffect,
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
	potions: number;
	baseHitPoints: number;
	baseMaxHitPoints: number;
	baseStats: TStats;
	baseResistances: TDamageTypes;
	createdAt: Date;
	updatedAt: Date;
}

export interface IEffectData {
	effect: ISkillEffect;
	effectTarget: ICharacter & ICharacterMethods;
	source: IEffectSource;
	target: Target;
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
	get frenzyMultiplier(): number;
	get auxiliaryEffects(): Record<AuxiliaryEffect, boolean>;

	// Backwards compatibility
	get isStunned(): boolean;
	get isPoisoned(): boolean;
	get isDisarmed(): boolean;
	get isBleeding(): boolean;
	get isSilenced(): boolean;
	get isBlinded(): boolean;
	get isFrenzied(): boolean;
	get isCharmed(): boolean;
	get isHasted(): boolean;
	get isCrippled(): boolean;
	get isBlessed(): boolean;
	get isCursed(): boolean;

	// Add methods here
	getEquipmentArmourClass(): number;
	getEquipmentBonus(type: PropertyType, name: string): number;
	getActiveEffectBonus(type: string, name: string): number;
	getAttribute(stat: Stat): number;
	getActiveAuxiliaryEffect(type: AuxiliaryEffect): boolean;
	getDamageBonus(type: DamageType): number;
	getHealBonus(): number;
	getResistance(type: DamageType): number;
	getAuxiliaryStat(type: AuxiliaryStat): number;
	getHitType(armourClass: number, modifier: number): HitType;
	setHitPoints(value: number): void;
	getUnarmedDamage(data: IEffectData): number;
	getWeaponDamage(data: IEffectData, weapon: IWeaponDataWithID): IDamageEffect;
	getWeaponsDamage(data: IEffectData): IDamageEffect[];
	getDamage(data: IEffectData): IDamageEffect;
	getHeal(data: IEffectData): IHealEffect;
	getStatus(data: IEffectData): IStatusEffect;
	getAuxiliary(data: IEffectData): IAuxiliaryEffect;
	getEffectTarget(target: Target): Target;
	createEmptyAction(data: ITurnData, name: string): IAction;
	createAction(data: ITurnData): IAction;
	handleDamage(damage: IDamageEffect): void;
	handleHeal(heal: IHealEffect): void;
	handleStatus(status: IStatusEffect): void;
	handleAuxiliary(auxiliary: IAuxiliaryEffect): void;
	handleAction(action: IAction, target: Target): void;
	tickPoison(damageBonus: number): void;
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

export interface IBuyPotionInput {
	quantity: number;
}

export interface RequestPotion extends Request {
	potion: IBuyPotionInput;
}
