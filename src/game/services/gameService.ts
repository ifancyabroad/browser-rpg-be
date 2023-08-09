import { Service } from "typedi";
import { IGameService } from "types/game";
import { MODIFIERS } from "@game/constants";

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

	public getHitPoints(constitution: number) {
		const hitPoints = this.d10 + this.getModifier(constitution);
		if (hitPoints < 1) {
			return 1;
		}
		return hitPoints;
	}
}
