import {
	ArmourType,
	AuxiliaryEffect,
	DamageType,
	EffectType,
	EquipmentSlot,
	EquipmentType,
	SkillClass,
	Stat,
	Tactics,
	Target,
	WeaponSize,
	WeaponType,
	Zone,
} from "@common/utils";
import { TProperty } from "./property";

export type TStats = Record<Stat, number>;
export type TDamageTypes = Record<DamageType, number>;
export type TEquipment = Record<EquipmentSlot, string>;

export interface IEnemyData {
	challenge: number;
	zone: Zone;
	resistances: TDamageTypes;
	description: string;
	name: string;
	portrait: string;
	boss: boolean;
	skills: string[];
	stats: TStats;
	tactics: Tactics;
	naturalArmourClass: number;
	naturalMinDamage: number;
	naturalMaxDamage: number;
	naturalDamageType: DamageType;
	equipment?: Partial<TEquipment>;
}

export interface IClassData {
	description: string;
	name: string;
	portrait: string;
	fallenImage: string;
	icon: string;
	skillClasses: SkillClass[];
	armourTypes: ArmourType[];
	weaponTypes: WeaponType[];
	skills: string[];
	stats: TStats;
	tactics: Tactics;
	equipment?: Partial<TEquipment>;
}

export interface IWeaponDamageEffectData {
	type: EffectType.WeaponDamage;
	target: Target;
	multiplier: number;
}

export interface IDamageEffectData {
	type: EffectType.Damage;
	target: Target;
	damageType: DamageType;
	min: number;
	max: number;
}

export interface IHealEffectData {
	type: EffectType.Heal;
	target: Target;
	min: number;
	max: number;
}

export interface IStatusEffectData {
	type: EffectType.Status;
	target: Target;
	modifier?: Stat;
	difficulty?: number;
	duration: number;
	properties?: TProperty[];
}

export interface IAuxiliaryEffectData {
	type: EffectType.Auxiliary;
	target: Target;
	modifier?: Stat;
	difficulty?: number;
	duration: number;
	effect: AuxiliaryEffect;
}

export type ISkillEffect =
	| IWeaponDamageEffectData
	| IDamageEffectData
	| IHealEffectData
	| IStatusEffectData
	| IAuxiliaryEffectData;

export type IWeaponEffect = IDamageEffectData | IHealEffectData | IStatusEffectData | IAuxiliaryEffectData;

export interface ISkillData {
	class: SkillClass;
	name: string;
	description: string;
	icon: string;
	effects: ISkillEffect[];
	price: number;
	maxUses: number;
	level: number;
}

export interface IWeaponData {
	type: EquipmentType.Weapon;
	weaponType: WeaponType;
	size: WeaponSize;
	name: string;
	description: string;
	icon: string;
	price: number;
	level: number;
	damageType: DamageType;
	min: number;
	max: number;
	effects?: IWeaponEffect[];
	properties?: TProperty[];
}

export interface IArmourData {
	type: EquipmentType;
	name: string;
	description: string;
	icon: string;
	price: number;
	level: number;
	armourType: ArmourType;
	armourClass?: number;
	properties?: TProperty[];
}

export interface IGameData {
	armours: Record<string, IArmourData>;
	classes: Record<string, IClassData>;
	monsters: Record<string, IEnemyData>;
	skills: Record<string, ISkillData>;
	weapons: Record<string, IWeaponData>;
}

export interface IEnemyDataWithID extends IEnemyData {
	id: string;
}

export interface ISkillDataWithID extends ISkillData {
	id: string;
}

export interface ISkillDataWithRemaining extends ISkillData {
	id: string;
	remaining: number;
}

export interface IClassDataWithID extends IClassData {
	id: string;
}

export interface IWeaponDataWithID extends IWeaponData {
	id: string;
	slot: EquipmentSlot;
}

export interface IArmourDataWithID extends IArmourData {
	id: string;
	slot: EquipmentSlot;
}

export type TEquipmentDataWithID = IWeaponDataWithID | IArmourDataWithID;
