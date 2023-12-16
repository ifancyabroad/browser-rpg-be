import { Schema, Types } from "mongoose";
import {
	AuxiliaryEffect,
	AuxiliaryStat,
	DamageType,
	EffectType,
	EquipmentType,
	HitType,
	PropertyType,
	Stat,
	Status,
	Target,
	WeaponType,
} from "@common/utils/enums/index";
import { activeEffectSchema, statusEffectSchema } from "./effects.model";
import { model } from "mongoose";
import { skillSchema } from "./skill.model";
import { GameData } from "@common/utils/game/GameData";
import { ICharacter, ICharacterMethods, ICharacterModel, IEffectData } from "@common/types/character";
import { mapToArray } from "@common/utils";
import {
	IAuxiliaryEffectData,
	IDamageEffectData,
	IHealEffectData,
	IStatusEffectData,
	IWeaponDamageEffectData,
	IWeaponDataWithID,
} from "@common/types/gameData";
import { Game } from "@common/utils/game/Game";
import { IAuxiliaryEffect, IDamageEffect, IHealEffect, IStatusEffect } from "@common/types/effect";
import { IAction, ITurnData } from "@common/types/battle";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

const characterSchema = new Schema<ICharacter, ICharacterModel, ICharacterMethods>(
	{
		name: {
			type: String,
			required: [true, "Please enter a name"],
			trim: true,
			minLength: 3,
			maxLength: 10,
		},
		status: {
			type: String,
			enum: Status,
			default: Status.Alive,
		},
		level: {
			type: Number,
			min: 1,
			max: 30,
			default: 1,
		},
		activeStatusEffects: {
			type: [statusEffectSchema],
		},
		activeAuxiliaryEffects: {
			type: [activeEffectSchema],
		},
		skillIDs: {
			type: [skillSchema],
		},
		equipmentIDs: {
			head: {
				type: String,
				default: null,
			},
			neck: {
				type: String,
				default: null,
			},
			body: {
				type: String,
				default: null,
			},
			waist: {
				type: String,
				default: null,
			},
			hands: {
				type: String,
				default: null,
			},
			feet: {
				type: String,
				default: null,
			},
			finger1: {
				type: String,
				default: null,
			},
			finger2: {
				type: String,
				default: null,
			},
			hand1: {
				type: String,
				default: null,
			},
			hand2: {
				type: String,
				default: null,
			},
		},
		baseHitPoints: {
			type: Number,
			required: true,
		},
		baseMaxHitPoints: {
			type: Number,
			required: true,
		},
		baseStats: {
			strength: {
				type: Number,
				min: 1,
				max: 30,
				required: true,
			},
			dexterity: {
				type: Number,
				min: 1,
				max: 30,
				required: true,
			},
			constitution: {
				type: Number,
				min: 1,
				max: 30,
				required: true,
			},
			intelligence: {
				type: Number,
				min: 1,
				max: 30,
				required: true,
			},
			wisdom: {
				type: Number,
				min: 1,
				max: 30,
				required: true,
			},
			charisma: {
				type: Number,
				min: 1,
				max: 30,
				required: true,
			},
		},
		baseResistances: {
			slashing: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			crushing: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			piercing: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			cold: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			fire: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			lightning: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			radiant: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			necrotic: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			poison: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
			acid: {
				type: Number,
				min: -100,
				max: 100,
				default: 0,
			},
		},
	},
	{ timestamps: true },
);

characterSchema.virtual("alive").get(function () {
	return this.hitPoints > 0;
});

characterSchema.virtual("skills").get(function () {
	return GameData.populateSkills(this.skillIDs);
});

characterSchema.virtual("stats").get(function () {
	return {
		[Stat.Strength]: this.getAttribute(Stat.Strength),
		[Stat.Dexterity]: this.getAttribute(Stat.Dexterity),
		[Stat.Constitution]: this.getAttribute(Stat.Constitution),
		[Stat.Intelligence]: this.getAttribute(Stat.Intelligence),
		[Stat.Wisdom]: this.getAttribute(Stat.Wisdom),
		[Stat.Charisma]: this.getAttribute(Stat.Charisma),
	};
});

characterSchema.virtual("resistances").get(function () {
	return {
		[DamageType.Crushing]: this.getResistance(DamageType.Crushing),
		[DamageType.Piercing]: this.getResistance(DamageType.Piercing),
		[DamageType.Slashing]: this.getResistance(DamageType.Slashing),
		[DamageType.Cold]: this.getResistance(DamageType.Cold),
		[DamageType.Fire]: this.getResistance(DamageType.Fire),
		[DamageType.Lightning]: this.getResistance(DamageType.Lightning),
		[DamageType.Acid]: this.getResistance(DamageType.Acid),
		[DamageType.Poison]: this.getResistance(DamageType.Poison),
		[DamageType.Necrotic]: this.getResistance(DamageType.Necrotic),
		[DamageType.Radiant]: this.getResistance(DamageType.Radiant),
	};
});

characterSchema.virtual("equipment").get(function () {
	return GameData.populateEquipment(this.equipmentIDs);
});

characterSchema.virtual("equipmentAsArray").get(function () {
	return mapToArray(this.equipment);
});

characterSchema.virtual("weaponsAsArray").get(function () {
	return this.equipmentAsArray.filter((item) => item.type === EquipmentType.Weapon) as IWeaponDataWithID[];
});

characterSchema.virtual("hitPoints").get(function () {
	const modifier = Game.getModifier(this.stats[Stat.Constitution]) * this.level;
	return Math.round(this.baseHitPoints + modifier);
});

characterSchema.virtual("maxHitPoints").get(function () {
	const modifier = Game.getModifier(this.stats[Stat.Constitution]) * this.level;
	return Math.round(this.baseMaxHitPoints + modifier);
});

characterSchema.virtual("armourClass").get(function () {
	return this.getEquipmentArmourClass() + this.getAuxiliaryStat(AuxiliaryStat.ArmourClass);
});

characterSchema.virtual("hitBonus").get(function () {
	return this.getAuxiliaryStat(AuxiliaryStat.HitChance);
});

characterSchema.virtual("critBonus").get(function () {
	return this.getAuxiliaryStat(AuxiliaryStat.CritChance);
});

characterSchema.virtual("isStunned").get(function () {
	return this.activeAuxiliaryEffects.map((effect) => effect.effect).includes(AuxiliaryEffect.Stun);
});

characterSchema.virtual("isPoisoned").get(function () {
	return this.activeAuxiliaryEffects.map((effect) => effect.effect).includes(AuxiliaryEffect.Poison);
});

characterSchema.virtual("isDisarmed").get(function () {
	return this.activeAuxiliaryEffects.map((effect) => effect.effect).includes(AuxiliaryEffect.Disarm);
});

characterSchema.virtual("isBleeding").get(function () {
	return this.activeAuxiliaryEffects.map((effect) => effect.effect).includes(AuxiliaryEffect.Bleed);
});

characterSchema.method("getEquipmentArmourClass", function getEquipmentArmourClass() {
	return mapToArray(this.equipmentAsArray)
		.map((item) => "armourClass" in item && item.armourClass)
		.reduce((n, value) => n + value, 0);
});

characterSchema.method("getEquipmentBonus", function getEquipmentBonus(type: PropertyType, name: string) {
	return mapToArray(this.equipmentAsArray)
		.flatMap((item) => ("properties" in item ? item.properties : []))
		.filter((property) => property.type === type && property.name === name)
		.reduce((n, { value }) => n + value, 0);
});

characterSchema.method("getActiveEffectBonus", function getActiveEffectBonus(type: string, name: string) {
	return this.activeStatusEffects
		.flatMap((effect) => effect.properties)
		.filter((property) => property.type === type && property.name === name)
		.reduce((n, { value }) => n + value, 0);
});

characterSchema.method("getAttribute", function getAttribute(stat: Stat) {
	return (
		this.baseStats[stat] +
		this.getEquipmentBonus(PropertyType.Stat, stat) +
		this.getActiveEffectBonus(PropertyType.Stat, stat)
	);
});

characterSchema.method("getDamageBonus", function getDamageBonus(type: DamageType) {
	return this.getEquipmentBonus(PropertyType.Damage, type) + this.getActiveEffectBonus(PropertyType.Damage, type);
});

characterSchema.method("getResistance", function getResistance(type: DamageType) {
	return (
		this.baseResistances[type] +
		this.getEquipmentBonus(PropertyType.Resistance, type) +
		this.getActiveEffectBonus(PropertyType.Resistance, type)
	);
});

characterSchema.method("getAuxiliaryStat", function getAuxiliaryStat(type: AuxiliaryStat) {
	return (
		this.getEquipmentBonus(PropertyType.AuxiliaryStat, type) +
		this.getActiveEffectBonus(PropertyType.AuxiliaryStat, type)
	);
});

characterSchema.method("getHitType", function getHitType(armourClass: number) {
	const modifier = Game.getModifier(this.stats.dexterity);
	const hitRoll = Math.round(Game.d20 + modifier + this.hitBonus);
	const critRoll = Math.round(Game.d20 + modifier + this.critBonus);
	if (hitRoll >= armourClass && critRoll >= 20) {
		return HitType.Crit;
	} else if (hitRoll >= armourClass) {
		return HitType.Hit;
	} else {
		return HitType.Miss;
	}
});

characterSchema.method("setHitPoints", function setHitPoints(value: number) {
	this.baseHitPoints = value;
	this.checkAlive();
});

characterSchema.method("checkAlive", function checkAlive() {
	if (!this.alive) {
		this.status = Status.Dead;
	}
});

characterSchema.method("checkConstitution", function checkConstitution() {
	if (!this.alive && this.status === Status.Alive) {
		this.setHitPoints(1);
	}
});

characterSchema.method("getUnarmedDamage", function getUnarmedDamage({ effect, effectTarget }: IEffectData) {
	const weaponEffect = effect as IWeaponDamageEffectData;
	const damage = Game.d4;
	const modifier = Game.getModifier(this.stats.strength);
	const bonusMultiplier = this.getDamageBonus(DamageType.Crushing) / 100 + 1;
	const hitType = this.getHitType(effectTarget.armourClass);
	const hitMultiplier = Game.getHitMultiplier(hitType);
	const resistance = effectTarget.getResistance(DamageType.Crushing) / 100;
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
		type: DamageType.Crushing,
		value,
		hitType,
	};
});

characterSchema.method(
	"getWeaponDamage",
	function getWeaponDamage({ effect, effectTarget }: IEffectData, weapon: IWeaponDataWithID) {
		const weaponEffect = effect as IWeaponDamageEffectData;
		const damage = Game.dx(weapon.min, weapon.max);
		const stat = Game.getWeaponStat(weapon.weaponType as WeaponType);
		const modifier = Game.getModifier(this.stats[stat]);
		const bonusMultiplier = this.getDamageBonus(weapon.damageType as DamageType) / 100 + 1;
		const hitType = this.getHitType(effectTarget.armourClass);
		const hitMultiplier = Game.getHitMultiplier(hitType);
		const resistance = effectTarget.getResistance(weapon.damageType) / 100;
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
			type: weapon.damageType,
			value,
			hitType,
		};
	},
);

characterSchema.method("getWeaponsDamage", function getWeaponsDamage(data: IEffectData) {
	if (this.weaponsAsArray.length > 0 && !this.isDisarmed) {
		return this.weaponsAsArray.map((weapon) => {
			return this.getWeaponDamage(data, weapon);
		});
	}
	return [this.getUnarmedDamage(data)];
});

characterSchema.method("getDamage", function getDamage({ effect, effectTarget }: IEffectData) {
	const damageEffect = effect as IDamageEffectData;
	const damage = Game.dx(damageEffect.min, damageEffect.max);
	const stat = Game.getDamageStat(damageEffect.damageType);
	const modifier = Game.getModifier(this.stats[stat]) ?? 0;
	const bonusMultiplier = this.getDamageBonus(damageEffect.damageType) / 100 + 1;
	const resistance = effectTarget.getResistance(damageEffect.damageType) / 100;
	const value = Math.round((damage + modifier) * bonusMultiplier * (1 - resistance));

	return {
		target: effect.target,
		type: damageEffect.damageType,
		value,
		hitType: HitType.Hit,
	};
});

characterSchema.method("getHeal", function getHeal({ effect }: IEffectData) {
	const healEffect = effect as IHealEffectData;
	const heal = Game.dx(healEffect.min, healEffect.max);
	const modifier = Game.getModifier(this.stats[Stat.Wisdom]);
	return {
		target: healEffect.target,
		value: heal + modifier,
	};
});

characterSchema.method("getStatus", function getStatus({ effect, effectTarget, skill }: IEffectData) {
	const statusEffect = effect as IStatusEffectData;

	let saved = false;
	if (statusEffect.modifier && statusEffect.difficulty) {
		const modifier = Game.getModifier(effectTarget.stats[statusEffect.modifier]);
		const roll = Game.d20 + modifier;
		saved = roll >= statusEffect.difficulty;
	}

	return {
		skill: {
			id: skill.id,
			name: skill.name,
			icon: skill.icon,
		},
		target: statusEffect.target,
		properties: statusEffect.properties,
		remaining: statusEffect.duration,
		duration: statusEffect.duration,
		saved,
		modifier: statusEffect.modifier,
		difficulty: statusEffect.difficulty,
	};
});

characterSchema.method("getAuxiliary", function getAuxiliary({ effect, effectTarget, skill }: IEffectData) {
	const auxiliaryEffect = effect as IAuxiliaryEffectData;

	let saved = false;
	if (auxiliaryEffect.modifier && auxiliaryEffect.difficulty) {
		const modifier = Game.getModifier(effectTarget.stats[auxiliaryEffect.modifier]);
		const roll = Game.d20 + modifier;
		saved = roll >= auxiliaryEffect.difficulty;
	}

	return {
		skill: {
			id: skill.id,
			name: skill.name,
			icon: skill.icon,
		},
		target: auxiliaryEffect.target,
		effect: auxiliaryEffect.effect,
		remaining: auxiliaryEffect.duration,
		duration: auxiliaryEffect.duration,
		saved,
		modifier: auxiliaryEffect.modifier,
		difficulty: auxiliaryEffect.difficulty,
	};
});

characterSchema.method("createAction", function createAction(data: ITurnData) {
	const skill = this.skills.find((sk) => sk.id === data.skill);

	if (!skill) {
		throw new Error("Skill is not available");
	}

	if (skill.maxUses > 0 && skill.remaining <= 0) {
		throw new Error("No uses remaining for this skill");
	}

	const action: IAction = {
		skill: skill.name,
		self: data.self.name,
		enemy: data.enemy.name,
		activeEffects: data.self.activeAuxiliaryEffects,
		weaponDamage: new Types.DocumentArray<IDamageEffect[]>([]),
		damage: new Types.DocumentArray<IDamageEffect>([]),
		heal: new Types.DocumentArray<IHealEffect>([]),
		status: new Types.DocumentArray<IStatusEffect>([]),
		auxiliary: new Types.DocumentArray<IAuxiliaryEffect>([]),
	};

	if (this.isStunned) {
		return action;
	}

	if (skill.maxUses > 0) {
		this.skillIDs.find((sk) => sk.id === data.skill).remaining--;
	}

	skill.effects.forEach((effect) => {
		const effectTarget = effect.target === Target.Self ? data.self : data.enemy;
		const effectData = { effect, effectTarget, skill };

		switch (effect.type) {
			case EffectType.WeaponDamage:
				action.weaponDamage.push(this.getWeaponsDamage(effectData));
				break;
			case EffectType.Damage:
				action.damage.push(this.getDamage(effectData));
				break;
			case EffectType.Heal:
				action.heal.push(this.getHeal(effectData));
				break;
			case EffectType.Status:
				action.status.push(this.getStatus(effectData));
				break;
			case EffectType.Auxiliary:
				action.auxiliary.push(this.getAuxiliary(effectData));
				break;
		}
	});

	return action;
});

characterSchema.method("handleDamage", function handleDamage(damage: IDamageEffect) {
	this.setHitPoints(this.baseHitPoints - damage.value);
});

characterSchema.method("handleHeal", function handleHeal(heal: IHealEffect) {
	const hitPoints = this.hitPoints + heal.value;
	if (hitPoints > this.maxHitPoints) {
		this.setHitPoints(this.baseMaxHitPoints);
	} else {
		this.setHitPoints(this.baseHitPoints + heal.value);
	}
});

characterSchema.method("handleStatus", function handleStatus(status: IStatusEffect) {
	if (status.saved) {
		return;
	}

	const existingStatusEffect = this.activeStatusEffects.find(({ skill }) => skill.id === status.skill.id);
	if (existingStatusEffect) {
		existingStatusEffect.remaining = existingStatusEffect.duration;
	} else {
		this.activeStatusEffects.push(status);
		this.checkAlive();
	}
});

characterSchema.method("handleAuxiliary", function handleAuxiliary(auxiliary: IAuxiliaryEffect) {
	if (auxiliary.saved) {
		return;
	}

	const existingAuxiliaryEffect = this.activeAuxiliaryEffects.find(({ effect }) => effect === auxiliary.effect);
	if (existingAuxiliaryEffect) {
		existingAuxiliaryEffect.remaining += auxiliary.duration;
	} else {
		this.activeAuxiliaryEffects.push({
			effect: auxiliary.effect,
			remaining: auxiliary.duration,
		});
	}
});

characterSchema.method("handleAction", function handleAction(action: IAction, target: Target) {
	action.weaponDamage.forEach((effects) => {
		effects.forEach((effect) => {
			if (effect.target === target) {
				this.handleDamage(effect);
			}
		});
	});
	action.damage.forEach((effect) => {
		if (effect.target === target) {
			this.handleDamage(effect);
		}
	});
	action.heal.forEach((effect) => {
		if (effect.target === target) {
			this.handleHeal(effect);
		}
	});
	action.status.forEach((effect) => {
		if (effect.target === target) {
			this.handleStatus(effect);
		}
	});
	action.auxiliary.forEach((effect) => {
		if (effect.target === target) {
			this.handleAuxiliary(effect);
		}
	});
});

characterSchema.method("tickPoison", function tickPoison() {
	if (this.isPoisoned) {
		const resistance = this.getResistance(DamageType.Poison) / 100;
		const damage = Math.round((this.maxHitPoints / 8) * (1 - resistance));
		this.setHitPoints(this.baseHitPoints - damage);
	}
});

characterSchema.method("tickEffects", function tickEffects() {
	const updatedStatusEffects = this.activeStatusEffects
		.filter((effect) => effect.remaining > 0)
		.map((effect) => ({ ...effect, remaining: effect.remaining - 1 }));
	const updatedAuxiliaryEffects = this.activeAuxiliaryEffects
		.filter((effect) => effect.remaining > 0)
		.map((effect) => ({ ...effect, remaining: effect.remaining - 1 }));

	this.set("activeStatusEffects", updatedStatusEffects);
	this.set("activeAuxiliaryEffects", updatedAuxiliaryEffects);

	this.checkConstitution();
});

characterSchema.plugin(mongooseLeanVirtuals);

const CharacterModel = model<ICharacter, ICharacterModel>("Character", characterSchema);

export { CharacterModel };
export default CharacterModel;
