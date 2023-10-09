import { Character } from "@game/Character";
import { getRandomElement } from "@common/utils/helpers";
import { IEnemy } from "@common/types/battle";

export class Enemy extends Character {
	constructor(public data: IEnemy) {
		super(data);
	}

	public get characterJSON() {
		return {
			...this.data,
			hitPoints: this.hitPoints,
			maxHitPoints: this.maxHitPoints,
		};
	}

	get skill() {
		return getRandomElement(this.skills);
	}

	get gold() {
		return 100 * (this.data.level + this.data.challenge);
	}

	get experience() {
		return 50 * (this.data.level + this.data.challenge);
	}

	get reward() {
		return { gold: this.gold, experience: this.experience };
	}
}
