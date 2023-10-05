import { EquipmentSlot, EquipmentType, Stat, WeaponType } from "@utils/enums/index";

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
	[3, 1],
	[4, 1],
	[5, 1],
	[6, 1],
	[7, 2],
	[8, 2],
	[9, 2],
	[10, 2],
	[11, 2],
	[12, 2],
	[13, 3],
	[14, 3],
	[15, 3],
	[16, 3],
	[17, 3],
	[18, 3],
	[19, 4],
	[20, 4],
	[21, 4],
	[22, 4],
	[23, 4],
	[24, 4],
	[25, 5],
	[26, 5],
	[27, 5],
	[28, 5],
	[29, 5],
	[30, 5],
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

export const EXPERIENCE_MAP = new Map([
	[1, 1000],
	[2, 2000],
	[3, 3000],
	[4, 4000],
	[5, 5000],
	[6, 6000],
	[7, 7000],
	[8, 8000],
	[9, 9000],
	[10, 10000],
	[11, 11000],
	[12, 12000],
	[13, 13000],
	[14, 14000],
	[15, 15000],
	[16, 16000],
	[17, 17000],
	[18, 18000],
	[19, 19000],
	[20, 20000],
	[21, 21000],
	[22, 22000],
	[23, 23000],
	[24, 24000],
	[25, 25000],
	[26, 26000],
	[27, 27000],
	[28, 28000],
	[29, 29000],
	[30, 30000],
]);

export const SKILL_LEVEL_MAP = new Map([
	[1, false],
	[2, false],
	[3, false],
	[4, false],
	[5, true],
	[6, false],
	[7, false],
	[8, false],
	[9, false],
	[10, true],
	[11, false],
	[12, false],
	[13, false],
	[14, false],
	[15, true],
	[16, false],
	[17, false],
	[18, false],
	[19, false],
	[20, true],
	[21, false],
	[22, false],
	[23, false],
	[24, false],
	[25, true],
	[26, false],
	[27, false],
	[28, false],
	[29, false],
	[30, true],
]);
