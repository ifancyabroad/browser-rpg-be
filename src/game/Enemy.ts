import { Character } from "@game/Character";
import { getRandomElement } from "@utils/helpers";
import { IEnemy } from "types/battle";

export class Enemy extends Character {
	constructor(public data: IEnemy) {
		super(data);
	}

	get skill() {
		return getRandomElement(this.skills);
	}
}
