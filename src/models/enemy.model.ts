import { Schema } from "mongoose";
import CharacterModel from "./character.model";
import { IEnemy, IEnemyMethods, IEnemyModel } from "@common/types/enemy";
import { IHero } from "@common/types/hero";
import { EffectType, Target, getRandomElement } from "@common/utils";

const enemySchema = new Schema<IEnemy, IEnemyModel, IEnemyMethods>(
	{
		name: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
		challenge: {
			type: Number,
			min: 1,
			max: 30,
			required: true,
		},
	},
	{ toJSON: { virtuals: true } },
);

enemySchema.virtual("rating").get(function () {
	const attributeTotal = Object.values(this.stats).reduce((total, value) => total + value, 0);
	const attributeAverage = attributeTotal / Object.keys(this.stats).length;
	return Math.round(attributeAverage);
});

enemySchema.method("getSkill", function getSkill(hero: IHero) {
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
		if (isBuff && this.activeStatusEffects.findIndex((effect) => effect.skill.id === skill.id) > -1) {
			return false;
		}

		const enemyTargetEffects = skill.effects
			.filter((effect) => effect.target === Target.Enemy)
			.map((effect) => effect.type);
		const isDebuff =
			enemyTargetEffects.includes(EffectType.Status) || enemyTargetEffects.includes(EffectType.Auxiliary);
		if (isDebuff && hero.activeStatusEffects.findIndex((effect) => effect.skill.id === skill.id) > -1) {
			return false;
		}

		return true;
	});

	return getRandomElement(skills);
});

const EnemyModel = CharacterModel.discriminator<IEnemy, IEnemyModel>("Enemy", enemySchema);

export { EnemyModel };
export default EnemyModel;
