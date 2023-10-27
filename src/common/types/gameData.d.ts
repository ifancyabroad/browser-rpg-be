import {
	ArmourType,
	DamageType,
	EquipmentSlot,
	EquipmentType,
	SkillClass,
	Stat,
	WeaponSize,
	WeaponType,
} from "@common/utils";
import { ISkillEffect, IWeaponEffect } from "./effect";
import { TProperty } from "./property";

export type TStats = Record<Stat, number>;
export type TDamageTypes = Record<DamageType, number>;
export type TEquipment = Record<EquipmentSlot, string>;

export interface IEnemyData {
	challenge: number;
	resistances: TDamageTypes;
	description: string;
	name: string;
	portrait: string;
	skills: string[];
	stats: TStats;
	equipment?: Partial<TEquipment>;
}

export interface IClassData {
	description: string;
	name: string;
	portrait: string;
	skillClasses: SkillClass[];
	armourTypes: ArmourType[];
	weaponTypes: WeaponType[];
	skills: string[];
	stats: TStats;
	equipment?: Partial<TEquipment>;
}

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
	armourType: ArmourType;
	name: string;
	description: string;
	icon: string;
	price: number;
	level: number;
	defence: number;
	properties?: TProperty[];
}

export interface IGameData {
	armours: Record<string, IArmourData>;
	classes: Record<string, IClassData>;
	monsters: Record<string, IEnemyData>;
	skills: Record<string, ISkillData>;
	weapons: Record<string, IWeaponData>;
}
