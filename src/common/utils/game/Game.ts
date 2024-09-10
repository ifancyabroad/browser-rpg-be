import {
	DAMAGE_TYPE_MODIFIER_MAP,
	HIT_TYPE_MULTIPLIER_MAP,
	MODIFIERS,
	WEAPON_MODIFIER_MAP,
	ZONES,
} from "@common/utils/constants";
import { DamageType, HitType, WeaponType } from "@common/utils/enums";

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

	public static getDamageStat(type: DamageType) {
		return DAMAGE_TYPE_MODIFIER_MAP.get(type);
	}

	public static getHitMultiplier(hitType: HitType) {
		return HIT_TYPE_MULTIPLIER_MAP.get(hitType);
	}

	public static getHitPoints(level = 1) {
		let hitPoints = 10;
		for (let i = 0; i < level; i++) {
			hitPoints += this.d10;
		}
		return hitPoints;
	}

	public static getIsBoss(battleLevel = 1) {
		return battleLevel % 10 === 0;
	}

	public static getEnemyLevel(battleLevel = 1) {
		return Math.ceil(battleLevel / 10);
	}

	public static getChallengeRating(battleLevel = 1) {
		return Math.ceil((battleLevel / 10) % ZONES.length);
	}

	public static getZone(battleLevel = 1) {
		const index = Math.floor((battleLevel / 10) % ZONES.length);
		return ZONES[index];
	}
}
