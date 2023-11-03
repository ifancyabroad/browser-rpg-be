import { DAMAGE_TYPE_MODIFIER_MAP, MODIFIERS, WEAPON_MODIFIER_MAP } from "@common/utils/constants";
import { DamageType, Target, WeaponType } from "@common/utils/enums";
import { IAction, ITurnData } from "@common/types/battle";

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

	public static getHitPoints(level = 1) {
		let hitPoints = 0;
		for (let i = 0; i < level; i++) {
			hitPoints += this.d10;
		}
		return hitPoints;
	}

	public static handleAction(first: ITurnData, second: ITurnData) {
		const turn: IAction[] = [];
		[first, second].forEach((data) => {
			if (data.self.alive && data.enemy.alive) {
				const action = data.self.createAction(data);
				const actionSelf = data.self.handleAction(action, Target.Self);
				const actionEnemy = data.enemy.handleAction(actionSelf, Target.Enemy);
				turn.push(actionEnemy);

				data.self.tickPoison();
				data.self.tickEffects();
			}
		});
		return turn;
	}

	public static handleTurn(hero: ITurnData, enemy: ITurnData) {
		let turn: IAction[];

		if (hero.self.stats.dexterity >= enemy.self.stats.dexterity) {
			turn = this.handleAction(hero, enemy);
		} else {
			turn = this.handleAction(enemy, hero);
		}

		return turn;
	}
}
