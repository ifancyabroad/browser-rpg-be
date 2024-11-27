import { Schema } from "mongoose";
import CharacterModel from "./character.model";
import { IEnemy, IEnemyMethods, IEnemyModel } from "@common/types/enemy";
import { IHero } from "@common/types/hero";
import { AuxiliaryStat, DamageType, EffectType, Game, Tactics, Target, Zone, getRandomElement } from "@common/utils";
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

enemySchema.method("getUnarmedDamage", function getUnarmedDamage({ effect, effectTarget }: IEffectData) {
	const weaponEffect = effect as IWeaponDamageEffectData;
	const damage = Game.dx(this.naturalMinDamage, this.naturalMaxDamage);
	const modifier = Game.getModifier(this.stats.strength);
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
	const priorities: ISkillDataWithRemaining[][] = [
		[], // Priority 1: Heal
		[], // Priority 2: Attack, Debuff, Buff
		[], // Priority 3: Default
	];

	this.skills.forEach((skill) => {
		if (skill.maxUses > 0 && skill.remaining <= 0) {
			return;
		}

		const selfTargetEffects = skill.effects
			.filter((effect) => effect.target === Target.Self)
			.map((effect) => effect.type);

		const enemyTargetEffects = skill.effects
			.filter((effect) => effect.target === Target.Enemy)
			.map((effect) => effect.type);

		const hasWeaponAttack = enemyTargetEffects.includes(EffectType.WeaponDamage);
		const hasAttack = enemyTargetEffects.includes(EffectType.Damage);
		const isCaster = this.tactics === Tactics.Caster;
		const hasSelfAttack = selfTargetEffects.includes(EffectType.Damage);
		const isConcede = this.tactics === Tactics.Concede;
		const isBaseAttack = skill.maxUses === 0;
		const hasHeal = selfTargetEffects.includes(EffectType.Heal);
		const isDamaged = this.hitPoints < this.maxHitPoints / 2;
		const isBadlyDamaged = this.hitPoints < this.maxHitPoints / 3;
		const hasBuff =
			selfTargetEffects.includes(EffectType.Status) || selfTargetEffects.includes(EffectType.Auxiliary);
		const isActiveBuff = this.activeStatusEffects.findIndex((effect) => effect.source.id === skill.id) > -1;
		const hasDebuff =
			enemyTargetEffects.includes(EffectType.Status) || enemyTargetEffects.includes(EffectType.Auxiliary);
		const isActiveDebuff = hero.activeStatusEffects.findIndex((effect) => effect.source.id === skill.id) > -1;

		if (hasHeal && isBadlyDamaged) {
			priorities[0].push(skill);
			return;
		}

		if (hasHeal && isDamaged) {
			priorities[1].push(skill);
			return;
		}

		if (hasSelfAttack && isConcede && isBadlyDamaged) {
			priorities[1].push(skill);
			return;
		}

		if (hasWeaponAttack && !isBaseAttack) {
			priorities[1].push(skill);
			return;
		}

		if (hasAttack && isCaster) {
			priorities[1].push(skill);
			return;
		}

		if (hasDebuff && !isActiveDebuff) {
			priorities[1].push(skill);
			return;
		}

		if (hasBuff && !isActiveBuff) {
			priorities[1].push(skill);
			return;
		}

		if (isBaseAttack) {
			priorities[2].push(skill);
			return;
		}

		if (hasAttack) {
			priorities[2].push(skill);
			return;
		}
	});

	const skills = priorities.find((priority) => priority.length > 0);

	return getRandomElement(skills);
});

const EnemyModel = CharacterModel.discriminator<IEnemy, IEnemyModel>("Enemy", enemySchema);

export { EnemyModel };
export default EnemyModel;
