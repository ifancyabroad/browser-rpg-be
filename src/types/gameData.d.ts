import { GameData } from "@game/GameData";

export type TEnemy = ReturnType<(typeof GameData)["getEnemy"]>;
export type TClass = ReturnType<(typeof GameData)["getCharacterClassById"]>;
export type TSkill = ReturnType<(typeof GameData)["getSkillById"]>;
export type TWeapon = ReturnType<(typeof GameData)["getWeaponById"]>;
export type TArmour = ReturnType<(typeof GameData)["getArmourById"]>;
export type TEquipment = ReturnType<(typeof GameData)["getEquipmentById"]>;
