import { Schema } from "mongoose";
import CharacterModel from "./character.model";
import { IEnemy, IEnemyMethods, IEnemyModel } from "@common/types/enemy";
import { IHero } from "@common/types/hero";
import {
	AuxiliaryStat,
	DamageType,
	EffectType,
	Game,
	Tactics,
	Target,
	Zone,
	getDeterminer,
	getRandomElement,
} from "@common/utils";
import { IEffectData } from "@common/types/character";
import { ISkillDataWithRemaining, IWeaponDamageEffectData } from "@common/types/gameData";

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
		zone: {
			type: String,
			enum: Zone,
			required: true,
		},
		boss: {
			type: Boolean,
			default: false,
		},
		hero: {
			type: Boolean,
			default: false,
		},
		username: {
			type: String,
		},
		tactics: {
			type: String,
			enum: Tactics,
			default: Tactics.Default,
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

enemySchema.virtual("nameWithDeterminer").get(function () {
	if (this.boss || this.hero) {
		return this.name;
	}
	const determiner = getDeterminer(this.name);
	return `${determiner} ${this.name}`;
});

enemySchema.method("getUnarmedDamage", function getUnarmedDamage({ effect, effectTarget }: IEffectData) {
	const weaponEffect = effect as IWeaponDamageEffectData;
	const damage = Game.dx(this.naturalMinDamage, this.naturalMaxDamage);
	const statValue = Math.max(this.stats.strength, this.stats.dexterity);
	const modifier = Game.getModifier(statValue);
	const bonusMultiplier = this.getDamageBonus(this.naturalDamageType) / 100 + 1;
	const hitType = this.getHitType(effectTarget.armourClass, modifier);
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
		value: Math.max(value, 0),
		hitType,
	};
});

enemySchema.method("getSkill", function getSkill(hero: IHero) {
	const priorities: ISkillDataWithRemaining[][] = [[], [], []];

	const isDamaged = this.hitPoints < this.maxHitPoints / 2;
	const isBadlyDamaged = this.hitPoints < this.maxHitPoints / 3;
	const isCaster = this.tactics === Tactics.Caster;
	const isConcede = this.tactics === Tactics.Concede;

	this.skills.forEach((skill) => {
		if (skill.maxUses > 0 && skill.remaining <= 0) return;

		const selfTargetEffects = skill.effects.filter((effect) => effect.target === Target.Self);
		const enemyTargetEffects = skill.effects.filter((effect) => effect.target === Target.Enemy);

		const hasWeaponAttack = enemyTargetEffects.some((effect) => effect.type === EffectType.WeaponDamage);
		const hasAttack = enemyTargetEffects.some((effect) => effect.type === EffectType.Damage);
		const hasSelfAttack = selfTargetEffects.some((effect) => effect.type === EffectType.Damage);
		const hasHeal = selfTargetEffects.some((effect) => effect.type === EffectType.Heal);
		const hasBuff = selfTargetEffects.some(
			(effect) => effect.type === EffectType.Status || effect.type === EffectType.Auxiliary,
		);
		const hasDebuff = enemyTargetEffects.some(
			(effect) => effect.type === EffectType.Status || effect.type === EffectType.Auxiliary,
		);
		const isBaseAttack = skill.maxUses === 0;
		const isAttackOnly = skill.effects.every(
			(effect) => effect.type === EffectType.Damage && effect.target === Target.Enemy,
		);
		const isActiveBuff = this.activeStatusEffects.some((effect) => effect.source.id === skill.id);
		const isActiveDebuff = hero.activeStatusEffects.some((effect) => effect.source.id === skill.id);

		if (hasHeal && isBadlyDamaged) {
			priorities[0].push(skill);
		} else if (hasSelfAttack && isConcede && isBadlyDamaged) {
			priorities[0].push(skill);
		} else if (this.isCharmed && !hasAttack && !hasWeaponAttack) {
			priorities[0].push(skill);
		} else if (hasHeal && isDamaged) {
			priorities[1].push(skill);
		} else if (hasWeaponAttack && !isBaseAttack) {
			priorities[1].push(skill);
		} else if (hasAttack && isCaster) {
			priorities[1].push(skill);
		} else if (isAttackOnly) {
			priorities[1].push(skill);
		} else if (hasDebuff && !isActiveDebuff) {
			priorities[1].push(skill);
		} else if (hasBuff && !isActiveBuff) {
			priorities[1].push(skill);
		} else if (isBaseAttack) {
			priorities[2].push(skill);
		} else if (hasAttack) {
			priorities[2].push(skill);
		} else {
			priorities[3].push(skill);
		}
	});

	const skills = priorities.find((priority) => priority.length > 0);

	if (skills.length) {
		return getRandomElement(skills);
	} else {
		return getRandomElement(this.skills);
	}
});

const EnemyModel = CharacterModel.discriminator<IEnemy, IEnemyModel>("Enemy", enemySchema);

export { EnemyModel };
export default EnemyModel;
