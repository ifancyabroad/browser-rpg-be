import {
	DamageType,
	EquipmentSlot,
	EquipmentType,
	HitType,
	ItemRarity,
	SkillClass,
	Stat,
	WeaponType,
	Zone,
} from "@common/utils/enums/index";

export const STARTING_GOLD = 200;
export const STARTING_POTIONS = 3;

export const MAX_STAT_VALUE = 22;

export const GOLD_MULTIPLIER = 4;
export const REWARD_GOLD_MULTIPLIER = 10;
export const EXPERIENCE_MULTIPLIER = 20;
export const BATTLE_MULTIPLIER_INCREMENT = 0.25;

export const SHOP_ITEMS = 6;

export const BASE_RESTOCK_PRICE = 20;
export const BASE_REST_PRICE = 20;
export const REST_MULTIPLIER = 1.25;

export const BASE_POTION_PRICE = 20;
export const MAX_POTIONS = 3;
export const FINAL_LEVEL = 100;

export const MAX_CHARACTER_LEVEL = 10;

export const MODIFIERS = new Map([
	[1, -5],
	[2, -4],
	[3, -4],
	[4, -3],
	[5, -3],
	[6, -2],
	[7, -2],
	[8, -1],
	[9, -1],
	[10, 0],
	[11, 0],
	[12, 1],
	[13, 1],
	[14, 2],
	[15, 2],
	[16, 3],
	[17, 3],
	[18, 4],
	[19, 4],
	[20, 5],
	[21, 5],
	[22, 6],
	[23, 6],
	[24, 7],
	[25, 7],
	[26, 8],
	[27, 8],
	[28, 9],
	[29, 9],
	[30, 10],
]);

export const EXPERIENCE_MAP = new Map([
	[1, 0],
	[2, 50],
	[3, 1000],
	[4, 5000],
	[5, 12000],
	[6, 20000],
	[7, 35000],
	[8, 55000],
	[9, 80000],
	[10, 100000],
]);

export const SKILL_LEVELS = new Map([
	[1, 1],
	[2, 1],
	[3, 2],
	[4, 2],
	[5, 3],
	[6, 3],
	[7, 4],
	[8, 4],
	[9, 4],
	[10, 4],
]);

export const SKILL_LEVEL_MAP = new Map([
	[1, false],
	[2, true],
	[3, false],
	[4, true],
	[5, false],
	[6, true],
	[7, false],
	[8, true],
	[9, false],
	[10, true],
]);

export const EQUIPMENT_SLOT_TYPE_MAP = new Map([
	[EquipmentType.Helmet, [EquipmentSlot.Head]],
	[EquipmentType.Amulet, [EquipmentSlot.Neck]],
	[EquipmentType.Armour, [EquipmentSlot.Body]],
	[EquipmentType.Belt, [EquipmentSlot.Waist]],
	[EquipmentType.Gloves, [EquipmentSlot.Hands]],
	[EquipmentType.Boots, [EquipmentSlot.Feet]],
	[EquipmentType.Ring, [EquipmentSlot.Finger1, EquipmentSlot.Finger2]],
	[EquipmentType.Weapon, [EquipmentSlot.Hand1, EquipmentSlot.Hand2]],
	[EquipmentType.Shield, [EquipmentSlot.Hand2]],
]);

export const WEAPON_MODIFIER_MAP = new Map([
	[WeaponType.Axe, Stat.Strength],
	[WeaponType.Bow, Stat.Dexterity],
	[WeaponType.Club, Stat.Strength],
	[WeaponType.Crossbow, Stat.Dexterity],
	[WeaponType.Dagger, Stat.Dexterity],
	[WeaponType.Hammer, Stat.Strength],
	[WeaponType.Mace, Stat.Strength],
	[WeaponType.Spear, Stat.Strength],
	[WeaponType.Staff, Stat.Strength],
	[WeaponType.Sword, Stat.Strength],
	[WeaponType.Wand, Stat.Intelligence],
]);

export const SKILL_CLASS_MODIFIER_MAP = new Map([
	[SkillClass.Mage, Stat.Intelligence],
	[SkillClass.Cleric, Stat.Wisdom],
	[SkillClass.Warrior, null],
	[SkillClass.Rogue, null],
	[SkillClass.Common, null],
	[SkillClass.Unique, null],
]);

export const HIT_TYPE_MULTIPLIER_MAP = new Map([
	[HitType.Crit, 2],
	[HitType.Hit, 1],
	[HitType.Miss, 0],
]);

export const ZONES = [
	Zone.Forest,
	Zone.Castle,
	Zone.Desert,
	Zone.Plains,
	Zone.Hills,
	Zone.Ocean,
	Zone.Volcano,
	Zone.Abyss,
	Zone.Dungeon,
	Zone.Tower,
];

export const ITEM_WEIGHT_LEVELS = [
	{
		[ItemRarity.Common]: 0.59,
		[ItemRarity.Uncommon]: 0.3,
		[ItemRarity.Rare]: 0.1,
		[ItemRarity.Epic]: 0.01,
	},
	{
		[ItemRarity.Common]: 0.53,
		[ItemRarity.Uncommon]: 0.3,
		[ItemRarity.Rare]: 0.15,
		[ItemRarity.Epic]: 0.02,
	},
	{
		[ItemRarity.Common]: 0.47,
		[ItemRarity.Uncommon]: 0.35,
		[ItemRarity.Rare]: 0.15,
		[ItemRarity.Epic]: 0.03,
	},
	{
		[ItemRarity.Common]: 0.41,
		[ItemRarity.Uncommon]: 0.35,
		[ItemRarity.Rare]: 0.2,
		[ItemRarity.Epic]: 0.04,
	},
	{
		[ItemRarity.Common]: 0.35,
		[ItemRarity.Uncommon]: 0.35,
		[ItemRarity.Rare]: 0.25,
		[ItemRarity.Epic]: 0.05,
	},
	{
		[ItemRarity.Common]: 0.29,
		[ItemRarity.Uncommon]: 0.35,
		[ItemRarity.Rare]: 0.3,
		[ItemRarity.Epic]: 0.06,
	},
	{
		[ItemRarity.Common]: 0.23,
		[ItemRarity.Uncommon]: 0.35,
		[ItemRarity.Rare]: 0.35,
		[ItemRarity.Epic]: 0.07,
	},
	{
		[ItemRarity.Common]: 0.17,
		[ItemRarity.Uncommon]: 0.35,
		[ItemRarity.Rare]: 0.4,
		[ItemRarity.Epic]: 0.08,
	},
	{
		[ItemRarity.Common]: 0.11,
		[ItemRarity.Uncommon]: 0.35,
		[ItemRarity.Rare]: 0.45,
		[ItemRarity.Epic]: 0.09,
	},
	{
		[ItemRarity.Common]: 0.05,
		[ItemRarity.Uncommon]: 0.35,
		[ItemRarity.Rare]: 0.5,
		[ItemRarity.Epic]: 0.1,
	},
];
