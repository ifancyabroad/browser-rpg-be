import { Service } from "typedi";
import { IGameService } from "types/game";
import { MODIFIERS, WEAPON_MODIFIER_MAP } from "@utils/constants";
import { IStats } from "types/character";
import { TEquipment, TWeapon } from "types/gameData";
import { WeaponType } from "@utils/enums";
import { IDamage } from "types/battle";

/* Game service */
@Service()
export class GameService implements IGameService {
	constructor() {}

	public get d4() {
		return Math.floor(Math.random() * 4) + 1;
	}

	public get d6() {
		return Math.floor(Math.random() * 6) + 1;
	}

	public get d8() {
		return Math.floor(Math.random() * 8) + 1;
	}

	public get d10() {
		return Math.floor(Math.random() * 10) + 1;
	}

	public get d12() {
		return Math.floor(Math.random() * 12) + 1;
	}

	public get d20() {
		return Math.floor(Math.random() * 20) + 1;
	}

	public dx(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	public getModifier(value: number) {
		return MODIFIERS.get(value);
	}

	public getWeaponStat(type: WeaponType) {
		return WEAPON_MODIFIER_MAP.get(type);
	}

	public getHitPoints(constitution: number, level: number = 1) {
		let hitPoints = this.d10;
		for (let i = 0; i < level; i++) {
			hitPoints += this.d10;
		}

		const modifierBonus = this.getModifier(constitution) * level;
		hitPoints += modifierBonus;

		return hitPoints > 0 ? hitPoints : 1;
	}

	public getRestPrice(day: number) {
		return day * 100;
	}

	public getEquipmentBonus(equipment: TEquipment[], type: string) {
		return equipment
			.flatMap((item) => "properties" in item && item.properties)
			.filter((item) => item.name === type)
			.reduce((n, { value }) => n + value, 0);
	}

	public getWeaponDamage(weapon: TWeapon, stats: IStats, bonus: number) {
		const damage = this.dx(weapon.min, weapon.min);
		const stat = this.getWeaponStat(weapon.type as WeaponType);
		const modifier = this.getModifier(stats[stat]);
		const multiplier = bonus / 100 + 1;
		return { type: weapon.damageType, value: (damage + modifier) * multiplier };
	}

	public handleWeaponDamage(weapons: TWeapon[], equipment: TEquipment[], stats: IStats) {
		const attacks: IDamage[] = [];
		weapons.forEach((weapon) => {
			const bonus = this.getEquipmentBonus(equipment, weapon.damageType);
			const damage = this.getWeaponDamage(weapon, stats, bonus);
			attacks.push(damage);
		});
		return attacks;
	}
}
