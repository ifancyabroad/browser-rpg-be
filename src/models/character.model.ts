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
import { ICharacter, ICharacterMethods, ICharacterModel } from "@common/types/character";
import { mapToArray } from "@common/utils";
import {
	IAuxiliaryEffectData,
	IDamageEffectData,
	IHealEffectData,
	ISkillDataWithID,
	IStatusEffectData,
	IWeaponDamageEffectData,
	IWeaponDataWithID,
} from "@common/types/gameData";
import { Game } from "@common/utils/game/Game";
import { IAuxiliaryEffect, IDamageEffect, IHealEffect, IStatusEffect } from "@common/types/effect";
import { IAction, ITurnData } from "@common/types/battle";

const characterSchema = new Schema<ICharacter, ICharacterModel, ICharacterMethods>({
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
	skills: {
		type: [skillSchema],
	},
	equipment: {
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
	hitPoints: {
		type: Number,
		required: true,
	},
	maxHitPoints: {
		type: Number,
		required: true,
	},
	stats: {
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
	resistances: {
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
});

characterSchema.virtual("vAlive").get(function () {
	return this.hitPoints > 0;
});

characterSchema.virtual("vSkills").get(function () {
	return GameData.populateSkills(this.skills);
});

characterSchema.virtual("vStats").get(function () {
	return {
		[Stat.Strength]: this.getAttribute(Stat.Strength),
		[Stat.Dexterity]: this.getAttribute(Stat.Dexterity),
		[Stat.Constitution]: this.getAttribute(Stat.Constitution),
		[Stat.Intelligence]: this.getAttribute(Stat.Intelligence),
		[Stat.Wisdom]: this.getAttribute(Stat.Wisdom),
		[Stat.Charisma]: this.getAttribute(Stat.Charisma),
	};
});

characterSchema.virtual("vResistances").get(function () {
	return {
		[DamageType.Crushing]: this.getResistance(DamageType.Crushing),
		[DamageType.Piercing]: this.getResistance(DamageType.Piercing),
		[DamageType.Slashing]: this.getResistance(DamageType.Slashing),
		[DamageType.Cold]: this.getResistance(DamageType.Cold),
		[DamageType.Fire]: this.getResistance(DamageType.Fire),
		[DamageType.Lighting]: this.getResistance(DamageType.Lighting),
		[DamageType.Acid]: this.getResistance(DamageType.Acid),
		[DamageType.Poison]: this.getResistance(DamageType.Poison),
		[DamageType.Necrotic]: this.getResistance(DamageType.Necrotic),
		[DamageType.Radiant]: this.getResistance(DamageType.Radiant),
	};
});

characterSchema.virtual("vEquipment").get(function () {
	return GameData.populateEquipment(this.equipment);
});

characterSchema.virtual("vEquipmentAsArray").get(function () {
	return mapToArray(this.vEquipment);
});

characterSchema.virtual("vWeaponsAsArray").get(function () {
	return this.vEquipmentAsArray.filter((item) => item.type === EquipmentType.Weapon) as IWeaponDataWithID[];
});

characterSchema.virtual("vHitPoints").get(function () {
	const modifier = Game.getModifier(this.stats[Stat.Constitution]) * this.level;
	const multiplier = this.getAuxiliaryStat(AuxiliaryStat.HitPoints) / 100 + 1;
	return Math.round((this.hitPoints + modifier) * multiplier);
});

characterSchema.virtual("vMaxHitPoints").get(function () {
	const modifier = Game.getModifier(this.stats[Stat.Constitution]) * this.level;
	return Math.round(this.maxHitPoints + modifier);
});

characterSchema.virtual("vDefence").get(function () {
	const multiplier = this.getAuxiliaryStat(AuxiliaryStat.Defence) / 100 + 1;
	return Math.round(this.getEquipmentDefence() * multiplier);
});

characterSchema.virtual("vHitBonus").get(function () {
	return this.getAuxiliaryStat(AuxiliaryStat.HitChance);
});

characterSchema.virtual("vCritBonus").get(function () {
	return this.getAuxiliaryStat(AuxiliaryStat.CritChance);
});

characterSchema.virtual("vIsStunned").get(function () {
	return this.activeAuxiliaryEffects.map((effect) => effect.effect).includes(AuxiliaryEffect.Stun);
});

characterSchema.virtual("vIsPoisoned").get(function () {
	return this.activeAuxiliaryEffects.map((effect) => effect.effect).includes(AuxiliaryEffect.Poison);
});

characterSchema.virtual("vIsDisarmed").get(function () {
	return this.activeAuxiliaryEffects.map((effect) => effect.effect).includes(AuxiliaryEffect.Disarm);
});

characterSchema.virtual("vIsBleeding").get(function () {
	return this.activeAuxiliaryEffects.map((effect) => effect.effect).includes(AuxiliaryEffect.Bleed);
});

characterSchema.method("getEquipmentDefence", function getEquipmentDefence() {
	return mapToArray(this.vEquipmentAsArray)
		.map((item) => "defence" in item && item.defence)
		.reduce((n, value) => n + value, 0);
});

characterSchema.method("getEquipmentBonus", function getEquipmentBonus(type: PropertyType, name: string) {
	return mapToArray(this.vEquipmentAsArray)
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
		this.stats[stat] +
		this.getEquipmentBonus(PropertyType.Stat, stat) +
		this.getActiveEffectBonus(PropertyType.Stat, stat)
	);
});

characterSchema.method("getDamageBonus", function getDamageBonus(type: DamageType) {
	return this.getEquipmentBonus(PropertyType.Damage, type) + this.getActiveEffectBonus(PropertyType.Damage, type);
});

characterSchema.method("getResistance", function getResistance(type: DamageType) {
	return (
		this.resistances[type] +
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

characterSchema.method("getHitType", function getHitType() {
	const modifier = Game.getModifier(this.vStats.dexterity);
	const hitMultiplier = this.vHitBonus / 100 + 1;
	const critMultiplier = this.vCritBonus / 100 + 1;
	const hitRoll = Math.round((Game.d20 + modifier) * hitMultiplier);
	const critRoll = Math.round((Game.d20 + modifier) * critMultiplier);
	if (hitRoll >= 10 && critRoll >= 20) {
		return HitType.Crit;
	} else if (hitRoll >= 10) {
		return HitType.Hit;
	} else {
		return HitType.Miss;
	}
});

characterSchema.method("setHitPoints", function setHitPoints(value: number) {
	this.hitPoints = value;
	this.checkAlive();
});

characterSchema.method("getUnarmedDamage", function getUnarmedDamage(effect: IWeaponDamageEffectData) {
	const damage = Game.d4;
	const modifier = Game.getModifier(this.vStats.strength);
	const bonusMultiplier = this.getDamageBonus(DamageType.Crushing) / 100 + 1;
	return {
		target: effect.target,
		type: DamageType.Crushing,
		value: (damage + modifier) * effect.multiplier * bonusMultiplier,
		hitType: this.getHitType(),
	};
});

characterSchema.method(
	"getWeaponDamage",
	function getWeaponDamage(weapon: IWeaponDataWithID, effect: IWeaponDamageEffectData) {
		const damage = Game.dx(weapon.min, weapon.max);
		const stat = Game.getWeaponStat(weapon.weaponType as WeaponType);
		const modifier = Game.getModifier(this.vStats[stat]);
		const bonusMultiplier = this.getDamageBonus(weapon.damageType as DamageType) / 100 + 1;
		const value = Math.round((damage + modifier) * effect.multiplier * bonusMultiplier);
		return {
			target: effect.target,
			type: weapon.damageType,
			value,
			hitType: this.getHitType(),
		};
	},
);

characterSchema.method("checkAlive", function checkAlive() {
	if (!this.vAlive) {
		this.status = Status.Dead;
	}
});

characterSchema.method("checkConstitution", function checkConstitution() {
	if (!this.vAlive && this.status === Status.Alive) {
		this.setHitPoints(1);
	}
});

characterSchema.method("getWeaponsDamage", function getWeaponsDamage(effect: IWeaponDamageEffectData) {
	if (this.vWeaponsAsArray.length > 0 && !this.vIsDisarmed) {
		return this.vWeaponsAsArray.map((weapon) => {
			return this.getWeaponDamage(weapon, effect);
		});
	}
	return [this.getUnarmedDamage(effect)];
});

characterSchema.method("getDamage", function getDamage(effect: IDamageEffectData) {
	const damage = Game.dx(effect.min, effect.max);
	const stat = Game.getDamageStat(effect.damageType as DamageType);
	const modifier = Game.getModifier(this.vStats[stat]) ?? 0;
	const bonusMultiplier = this.getDamageBonus(effect.damageType) / 100 + 1;
	const value = Math.round((damage + modifier) * bonusMultiplier);
	return {
		target: effect.target,
		type: effect.damageType,
		value,
		hitType: HitType.Hit,
	};
});

characterSchema.method("getHeal", function getHeal(effect: IHealEffectData) {
	const heal = Game.dx(effect.min, effect.max);
	const modifier = Game.getModifier(this.vStats[Stat.Wisdom]);
	return {
		target: effect.target,
		value: heal + modifier,
	};
});

characterSchema.method("getStatus", function getStatus(effect: IStatusEffectData, skill: ISkillDataWithID) {
	return {
		skill: {
			id: skill.id,
			name: skill.name,
			icon: skill.icon,
		},
		target: effect.target,
		properties: effect.properties,
		remaining: effect.duration,
		duration: effect.duration,
		saved: false,
		modifier: effect.modifier,
		difficulty: effect.difficulty,
	};
});

characterSchema.method("getAuxiliary", function getAuxiliary(effect: IAuxiliaryEffectData, skill: ISkillDataWithID) {
	return {
		skill: {
			id: skill.id,
			name: skill.name,
			icon: skill.icon,
		},
		target: effect.target,
		effect: effect.effect,
		remaining: effect.duration,
		duration: effect.duration,
		saved: false,
		modifier: effect.modifier,
		difficulty: effect.difficulty,
	};
});

characterSchema.method("createAction", function createAction(data: ITurnData) {
	const skill = this.vSkills.find((sk) => sk.id === data.skill);

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

	if (this.vIsStunned) {
		return action;
	}

	if (skill.maxUses > 0) {
		this.skills.find((sk) => sk.id === data.skill).remaining--;
	}

	skill.effects.forEach((effect) => {
		switch (effect.type) {
			case EffectType.WeaponDamage:
				action.weaponDamage.push(this.getWeaponsDamage(effect as IWeaponDamageEffectData));
				break;
			case EffectType.Damage:
				action.damage.push(this.getDamage(effect as IDamageEffectData));
				break;
			case EffectType.Heal:
				action.heal.push(this.getHeal(effect as IHealEffectData));
				break;
			case EffectType.Status:
				action.status.push(this.getStatus(effect as IStatusEffectData, skill));
				break;
			case EffectType.Auxiliary:
				action.auxiliary.push(this.getAuxiliary(effect as IAuxiliaryEffectData, skill));
				break;
		}
	});

	return action;
});

characterSchema.method("handleWeaponDamage", function handleWeaponDamage(damage: IDamageEffect) {
	const resistance = this.vDefence / 100;
	damage.value = Math.round(damage.value * (1 - resistance));
	if (this.vIsBleeding) {
		damage.value = Math.round(damage.value * 1.5);
	}
	return this.handleDamage(damage);
});

characterSchema.method("handleDamage", function handleDamage(damage: IDamageEffect) {
	const resistance = this.getResistance(damage.type as DamageType) / 100;
	let value = Math.round(damage.value * (1 - resistance));
	if (damage.hitType === HitType.Crit) {
		value *= 2;
	}
	if (damage.hitType === HitType.Miss) {
		value = 0;
	}
	if (value < 0) {
		value = 0;
	}
	this.setHitPoints(this.hitPoints - value);
	return { ...damage, value };
});

characterSchema.method("handleHeal", function handleHeal(heal: IHealEffect) {
	const hitPoints = this.vHitPoints + heal.value;
	if (hitPoints > this.vMaxHitPoints) {
		this.setHitPoints(this.maxHitPoints);
	} else {
		this.setHitPoints(this.hitPoints + heal.value);
	}
	return heal;
});

characterSchema.method("handleStatus", function handleStatus(status: IStatusEffect) {
	if (status.modifier && status.difficulty) {
		const modifier = Game.getModifier(this.vStats[status.modifier]);
		const roll = Game.d20 + modifier;
		status.saved = roll >= status.difficulty;
	}

	if (status.saved) {
		return status;
	}

	const existingStatusEffect = this.activeStatusEffects.find(({ skill }) => skill.id === status.skill.id);
	if (existingStatusEffect) {
		existingStatusEffect.remaining = existingStatusEffect.duration;
	} else {
		this.activeStatusEffects.push(status);
		this.checkAlive();
	}

	return status;
});

characterSchema.method("handleAuxiliary", function handleAuxiliary(auxiliary: IAuxiliaryEffect) {
	if (auxiliary.modifier && auxiliary.difficulty) {
		const modifier = Game.getModifier(this.vStats[auxiliary.modifier]);
		const roll = Game.d20 + modifier;
		auxiliary.saved = roll >= auxiliary.difficulty;
	}

	if (auxiliary.saved) {
		return auxiliary;
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

	return auxiliary;
});

characterSchema.method("handleAction", function handleAction(action: IAction, target: Target) {
	const weaponDamage = action.weaponDamage.map((effects) =>
		effects.map((effect) => (effect.target === target ? this.handleWeaponDamage(effect) : effect)),
	);
	const damage = action.damage.map((effect) => (effect.target === target ? this.handleDamage(effect) : effect));
	const heal = action.heal.map((effect) => (effect.target === target ? this.handleHeal(effect) : effect));
	const status = action.status.map((effect) => (effect.target === target ? this.handleStatus(effect) : effect));
	const auxiliary = action.auxiliary.map((effect) =>
		effect.target === target ? this.handleAuxiliary(effect) : effect,
	);

	return {
		...action,
		weaponDamage,
		damage,
		heal,
		status,
		auxiliary,
	};
});

characterSchema.method("tickPoison", function tickPoison() {
	if (this.vIsPoisoned) {
		const resistance = this.getResistance(DamageType.Poison) / 100;
		const damage = Math.round((this.vMaxHitPoints / 8) * (1 - resistance));
		this.setHitPoints(this.hitPoints - damage);
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

const CharacterModel = model<ICharacter, ICharacterModel>("Character", characterSchema);

export { CharacterModel };
export default CharacterModel;
