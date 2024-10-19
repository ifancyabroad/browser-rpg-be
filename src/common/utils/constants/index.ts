import {
	DamageType,
	EquipmentSlot,
	EquipmentType,
	HitType,
	ItemRarity,
	Stat,
	WeaponType,
	Zone,
} from "@common/utils/enums/index";

export const GOLD_MULTIPLIER = 5;
export const REWARD_GOLD_MULTIPLIER = 50;
export const EXPERIENCE_MULTIPLIER = 20;
export const BATTLE_MULTIPLIER_INCREMENT = 0.25;

export const SHOP_ITEMS = 6;
export const SHOP_LEVEL = 0;

export const BASE_RESTOCK_PRICE = 20;
export const BASE_REST_PRICE = 10;

export const POTION_PRICE = 200;
export const MAX_POTIONS = 3;

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
	[2, 500],
	[3, 2000],
	[4, 4500],
	[5, 8000],
	[6, 12500],
	[7, 18000],
	[8, 24500],
	[9, 32000],
	[10, 40500],
]);

export const SKILL_LEVELS = new Map([
	[1, 1],
	[2, 1],
	[3, 2],
	[4, 2],
	[5, 2],
	[6, 3],
	[7, 3],
	[8, 3],
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
	[WeaponType.Crossbow, Stat.Strength],
	[WeaponType.Dagger, Stat.Dexterity],
	[WeaponType.Hammer, Stat.Strength],
	[WeaponType.Mace, Stat.Strength],
	[WeaponType.Spear, Stat.Strength],
	[WeaponType.Staff, Stat.Strength],
	[WeaponType.Sword, Stat.Strength],
	[WeaponType.Wand, Stat.Intelligence],
]);

export const DAMAGE_TYPE_MODIFIER_MAP = new Map([
	[DamageType.Crushing, null],
	[DamageType.Piercing, null],
	[DamageType.Slashing, null],
	[DamageType.Cold, Stat.Intelligence],
	[DamageType.Fire, Stat.Intelligence],
	[DamageType.Lightning, Stat.Intelligence],
	[DamageType.Necrotic, Stat.Wisdom],
	[DamageType.Radiant, Stat.Wisdom],
	[DamageType.Acid, null],
	[DamageType.Poison, null],
]);

export const HIT_TYPE_MULTIPLIER_MAP = new Map([
	[HitType.Crit, 2],
	[HitType.Hit, 1],
	[HitType.Miss, 0],
]);

export const ZONES = [Zone.Forest, Zone.Desert, Zone.Ocean, Zone.Hills, Zone.Volcano];

export const ITEM_WEIGHT_LEVELS = [
	{
		[ItemRarity.Common]: 0.55,
		[ItemRarity.Uncommon]: 0.3,
		[ItemRarity.Rare]: 0.1,
		[ItemRarity.Epic]: 0.05,
	},
	{
		[ItemRarity.Common]: 0.5,
		[ItemRarity.Uncommon]: 0.3,
		[ItemRarity.Rare]: 0.15,
		[ItemRarity.Epic]: 0.05,
	},
	{
		[ItemRarity.Common]: 0.4,
		[ItemRarity.Uncommon]: 0.35,
		[ItemRarity.Rare]: 0.15,
		[ItemRarity.Epic]: 0.1,
	},
	{
		[ItemRarity.Common]: 0.3,
		[ItemRarity.Uncommon]: 0.4,
		[ItemRarity.Rare]: 0.2,
		[ItemRarity.Epic]: 0.1,
	},
	{
		[ItemRarity.Common]: 0.3,
		[ItemRarity.Uncommon]: 0.35,
		[ItemRarity.Rare]: 0.2,
		[ItemRarity.Epic]: 0.15,
	},
];
