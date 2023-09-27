import { MODIFIERS, WEAPON_MODIFIER_MAP } from "@utils/constants";
import { WeaponType } from "@utils/enums";

export class Game {
	public static get d4() {
		return Math.floor(Math.random() * 4) + 1;
	}

	public static get d6() {
		return Math.floor(Math.random() * 6) + 1;
	}

	public static get d8() {
		return Math.floor(Math.random() * 8) + 1;
	}

	public static get d10() {
		return Math.floor(Math.random() * 10) + 1;
	}

	public static get d12() {
		return Math.floor(Math.random() * 12) + 1;
	}

	public static get d20() {
		return Math.floor(Math.random() * 20) + 1;
	}

	public static dx(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	public static getModifier(value: number) {
		return MODIFIERS.get(value);
	}

	public static getWeaponStat(type: WeaponType) {
		return WEAPON_MODIFIER_MAP.get(type);
	}

	public static getHitPoints(constitution: number, level = 1) {
		let hitPoints = this.d10;
		for (let i = 0; i < level; i++) {
			hitPoints += this.d10;
		}

		const modifierBonus = this.getModifier(constitution) * level;
		hitPoints += modifierBonus;

		return hitPoints > 0 ? hitPoints : 1;
	}
}
