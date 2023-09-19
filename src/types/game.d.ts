import { Stat, WeaponType } from "@utils/enums";
import { IDamage } from "./battle";
import { IStats } from "./character";
import { TEquipment, TWeapon } from "./gameData";

export interface IGameService {
	d4: number;
	d6: number;
	d8: number;
	d10: number;
	d12: number;
	d20: number;
	dx: (min: number, max: number) => number;

	getModifier: (value: number) => number;
	getWeaponStat: (type: WeaponType) => Stat;
	getHitPoints: (constitution: number) => number;
	getRestPrice: (day: number) => number;
	getEquipmentBonus: (equipment: TEquipment[], type: string) => number;
	getWeaponDamage: (weapons: TWeapon, stats: IStats, bonus: number) => IDamage;
	handleWeaponDamage: (weapons: TWeapon[], equipment: TEquipment[], stats: IStats) => IDamage[];
}
