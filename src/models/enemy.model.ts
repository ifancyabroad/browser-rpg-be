import { Schema } from "mongoose";
import CharacterModel from "./character.model";
import { IEnemy, IEnemyMethods, IEnemyModel } from "@common/types/enemy";
import { IHero } from "@common/types/hero";
import { AuxiliaryStat, DamageType, EffectType, Game, Target, getRandomElement } from "@common/utils";
import { IEffectData } from "@common/types/character";
import { IWeaponDamageEffectData } from "@common/types/gameData";

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
		naturalArmourClass: {
			type: Number,
			min: 0,
			max: 30,
			required: true,
		},
		naturalMinDamage: {
			type: Number,
			min: 0,
			max: 100,
			required: true,
		},
		naturalMaxDamage: {
			type: Number,
			min: 0,
			max: 100,
			required: true,
		},
		naturalDamageType: {
			type: String,
			enum: DamageType,
			required: true,
		},
	},
	{ toJSON: { virtuals: true } },
);

enemySchema.virtual("armourClass").get(function () {
	return (
		Math.max(this.getEquipmentArmourClass(), this.naturalArmourClass) +
		this.getAuxiliaryStat(AuxiliaryStat.ArmourClass)
	);
});

enemySchema.virtual("rating").get(function () {
	const attributeTotal = Object.values(this.stats).reduce((total, value) => total + value, 0);
	const attributeAverage = attributeTotal / Object.keys(this.stats).length;
	return Math.round(attributeAverage);
});

enemySchema.method("getUnarmedDamage", function getUnarmedDamage({ effect, effectTarget }: IEffectData) {
	const weaponEffect = effect as IWeaponDamageEffectData;
	const damage = Game.dx(this.naturalMinDamage, this.naturalMaxDamage);
	const modifier = Game.getModifier(this.stats.strength);
	const bonusMultiplier = this.getDamageBonus(this.naturalDamageType) / 100 + 1;
	const hitType = this.getHitType(effectTarget.armourClass);
	const hitMultiplier = Game.getHitMultiplier(hitType);
	const resistance = effectTarget.getResistance(this.naturalDamageType) / 100;
	const bleedMuliplier = effectTarget.isBleeding ? 1.5 : 1;
	const value = Math.round(
		(damage + modifier) *
			weaponEffect.multiplier *
			bonusMultiplier *
			hitMultiplier *
			bleedMuliplier *
			(1 - resistance),
	);

	return {
		target: effect.target,
		type: this.naturalDamageType,
		value,
		hitType,
	};
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
