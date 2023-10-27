import { Character } from "@game/Character";
import { getRandomElement } from "@common/utils/helpers";
import { IEnemy } from "@common/types/battle";
import { EffectType, Target } from "@common/utils";
import { Hero } from "./Hero";

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

	get gold() {
		return 100 * (this.data.level + this.data.challenge);
	}

	get experience() {
		return 50 * (this.data.level + this.data.challenge);
	}

	get reward() {
		return { gold: this.gold, experience: this.experience };
	}

	public getSkill(hero: Hero) {
		const skills = this.skills.filter((skill) => {
			if (skill.maxUses > 0 && skill.remaining <= 0) {
				return false;
			}

			const selfTargetEffects = skill.effects
				.filter((effect) => effect.target === Target.Self)
				.map((effect) => effect.type);
			const isHeal = selfTargetEffects.includes(EffectType.Heal);
			if (isHeal && this.hitPoints >= this.maxHitPoints) {
				return false;
			}

			const isBuff =
				selfTargetEffects.includes(EffectType.Status) || selfTargetEffects.includes(EffectType.Auxiliary);
			if (isBuff && this.data.activeStatusEffects.findIndex((effect) => effect.skill.id === skill.id) > -1) {
				return false;
			}

			const enemyTargetEffects = skill.effects
				.filter((effect) => effect.target === Target.Enemy)
				.map((effect) => effect.type);
			const isDebuff =
				enemyTargetEffects.includes(EffectType.Status) || enemyTargetEffects.includes(EffectType.Auxiliary);
			if (isDebuff && hero.data.activeStatusEffects.findIndex((effect) => effect.skill.id === skill.id) > -1) {
				return false;
			}

			return true;
		});

		return getRandomElement(skills);
	}
}
