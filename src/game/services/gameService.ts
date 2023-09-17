import { Service } from "typedi";
import { IGameService } from "types/game";
import { MODIFIERS } from "@utils/constants";
import { ICharacter } from "types/character";

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

	public getModifier(value: number) {
		return MODIFIERS.get(value);
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
}
