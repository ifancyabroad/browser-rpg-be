import { TDamageTypes, TStats } from "@common/types/gameData";
import {
	HIT_TYPE_MULTIPLIER_MAP,
	FINAL_LEVEL,
	MODIFIERS,
	SKILL_CLASS_MODIFIER_MAP,
	WEAPON_MODIFIER_MAP,
	ZONES,
	NEW_GAME_RESISTANCE_BONUS,
	NEW_GAME_STAT_BONUS,
	MAX_STAT_LEVEL,
	MAX_ENEMY_LEVEL,
} from "@common/utils/constants";
import { HitType, SkillClass, WeaponType } from "@common/utils/enums";

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

	public static getDamageStat(type: SkillClass) {
		return SKILL_CLASS_MODIFIER_MAP.get(type);
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

	public static getIsBoss(battleLevel: number) {
		return battleLevel % 10 === 0;
	}

	public static getEnemyLevel(battleLevel: number) {
		const level = Math.ceil(battleLevel / 10);
		return Math.min(level, MAX_ENEMY_LEVEL);
	}

	public static getZone(battleLevel: number) {
		const index = Math.floor(((battleLevel - 1) / 10) % ZONES.length);
		return ZONES[index];
	}

	public static getGameLevel(battleLevel: number) {
		return Math.ceil(battleLevel / FINAL_LEVEL) - 1;
	}

	public static getEnemyResistances(gameLevel: number, resistances: TDamageTypes) {
		const bonus = gameLevel * NEW_GAME_RESISTANCE_BONUS;
		const newResistances = {} as TDamageTypes;
		for (const key of Object.keys(resistances) as (keyof TDamageTypes)[]) {
			const value = resistances[key] + bonus;
			newResistances[key] = Math.min(value, 100);
		}
		return newResistances;
	}

	public static getEnemyStats(gameLevel: number, stats: TStats) {
		const bonus = gameLevel * NEW_GAME_STAT_BONUS;
		const newStats = {} as TStats;
		for (const key of Object.keys(stats) as (keyof TStats)[]) {
			const value = stats[key] + bonus;
			newStats[key] = Math.min(value, MAX_STAT_LEVEL);
		}
		return newStats;
	}
}
