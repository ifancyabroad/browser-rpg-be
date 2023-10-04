import { MODIFIERS, WEAPON_MODIFIER_MAP } from "@utils/constants";
import { Target, WeaponType } from "@utils/enums";
import { IAction, ITurnData } from "types/battle";

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

	public static handleAction(first: ITurnData, second: ITurnData) {
		const turn: IAction[] = [];
		[first, second].forEach((data) => {
			if (data.self.alive && data.enemy.alive) {
				const action = data.self.createAction(data);
				const actionSelf = data.self.handleAction(action, Target.Self);
				const actionFinal = data.enemy.handleAction(actionSelf, Target.Enemy);
				turn.push(actionFinal);
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
