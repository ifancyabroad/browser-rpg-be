import { GameDataService } from "@game/services/gameDataService";
import { IEquipment } from "./character";
import { EquipmentType } from "@utils/enums";

export type TEnemy = ReturnType<GameDataService["getEnemy"]>;
export type TClass = ReturnType<GameDataService["getCharacterClassById"]>;
export type TSkill = ReturnType<GameDataService["getSkillById"]>;
export type TWeapon = ReturnType<GameDataService["getWeaponById"]>;
export type TArmour = ReturnType<GameDataService["getArmourById"]>;
export type TEquipment = ReturnType<GameDataService["getEquipmentById"]>;

export interface IGameDataService {
	getClasses: () => TClass[];
	getCharacterClassById: (id: string) => TClass;
	getSkillById: (id: string) => TSkill;
	getWeaponById: (id: string) => TWeapon;
	getArmourById: (id: string) => TArmour;
	getEquipmentById: (id: string) => TEquipment;
	getShopItems: (classID: string, level: number) => string[];
	getEnemy: (day: number) => TEnemy;
	getEquipment: (equipment: Partial<IEquipment>) => TEquipment[];
	getEquipmentByType: (equipment: Partial<IEquipment>, type: EquipmentType) => TEquipment[];
	getWeapons: (equipment: Partial<IEquipment>) => TEquipment[];
}
