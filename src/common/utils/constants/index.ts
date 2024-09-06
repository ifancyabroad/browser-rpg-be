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
export const EXPERIENCE_MULTIPLIER = 20;

export const SHOP_ITEMS = 6;
export const SHOP_LEVEL = 1;

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

export const EQUIPMENT_LEVELS = new Map([
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

export const EXPERIENCE_MAP = new Map([
	[1, 0],
	[2, 300],
	[3, 800],
	[4, 1500],
	[5, 2200],
	[6, 3000],
	[7, 4000],
	[8, 5200],
	[9, 7000],
	[10, 10000],
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

export const ZONES = [Zone.Forest, Zone.Hills, Zone.Hell];

export const ITEM_WEIGHT_LEVELS = [
	{
		[ItemRarity.Common]: 0.6,
		[ItemRarity.Uncommon]: 0.3,
		[ItemRarity.Rare]: 0.1,
		[ItemRarity.Epic]: 0,
	},
	{
		[ItemRarity.Common]: 0.4,
		[ItemRarity.Uncommon]: 0.3,
		[ItemRarity.Rare]: 0.2,
		[ItemRarity.Epic]: 0.1,
	},
	{
		[ItemRarity.Common]: 0.3,
		[ItemRarity.Uncommon]: 0.3,
		[ItemRarity.Rare]: 0.2,
		[ItemRarity.Epic]: 0.2,
	},
	{
		[ItemRarity.Common]: 0.2,
		[ItemRarity.Uncommon]: 0.3,
		[ItemRarity.Rare]: 0.3,
		[ItemRarity.Epic]: 0.2,
	},
	{
		[ItemRarity.Common]: 0.1,
		[ItemRarity.Uncommon]: 0.2,
		[ItemRarity.Rare]: 0.3,
		[ItemRarity.Epic]: 0.4,
	},
];
