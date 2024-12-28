import { Schema, Types } from "mongoose";
import {
	ArmourType,
	AuxiliaryEffect,
	AuxiliaryStat,
	DamageType,
	EffectType,
	EquipmentSlot,
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
import { MAX_POTIONS } from "@common/utils";
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
import { IAction, IActionWeaponEffect, ITurnData } from "@common/types/battle";

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
			max: 100,
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
		potions: {
			type: Number,
			min: 0,
			max: MAX_POTIONS,
			default: 0,
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
	{ timestamps: true, toJSON: { virtuals: true } },
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

characterSchema.virtual("damageBonuses").get(function () {
	return {
		[DamageType.Crushing]: this.getDamageBonus(DamageType.Crushing),
		[DamageType.Piercing]: this.getDamageBonus(DamageType.Piercing),
		[DamageType.Slashing]: this.getDamageBonus(DamageType.Slashing),
		[DamageType.Cold]: this.getDamageBonus(DamageType.Cold),
		[DamageType.Fire]: this.getDamageBonus(DamageType.Fire),
		[DamageType.Lightning]: this.getDamageBonus(DamageType.Lightning),
		[DamageType.Acid]: this.getDamageBonus(DamageType.Acid),
		[DamageType.Poison]: this.getDamageBonus(DamageType.Poison),
		[DamageType.Necrotic]: this.getDamageBonus(DamageType.Necrotic),
		[DamageType.Radiant]: this.getDamageBonus(DamageType.Radiant),
	};
});

characterSchema.virtual("equipment").get(function () {
	return GameData.populateEquipment(this.equipmentIDs);
});

characterSchema.virtual("equipmentAsArray").get(function () {
	return Object.keys(this.equipment)
		.map((id) => this.equipment[id as keyof typeof this.equipment])
		.filter((item) => item);
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
	const armour = this.equipment.body;
	const modifier = Game.getModifier(this.stats.dexterity) ?? 0;

	if (!armour || !("armourClass" in armour)) {
		return 0; // Make sure monsters don't get a bonus from not having armour
	} else if (armour.armourType === ArmourType.Heavy) {
		return armour.armourClass;
	} else if (armour.armourType === ArmourType.Medium) {
		return armour.armourClass + Math.min(2, modifier);
	} else {
		return armour.armourClass + Math.min(5, modifier);
	}
});

characterSchema.method("getEquipmentBonus", function getEquipmentBonus(type: PropertyType, name: string) {
	return this.equipmentAsArray
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
	const value =
		this.baseStats[stat] +
		this.getEquipmentBonus(PropertyType.Stat, stat) +
		this.getActiveEffectBonus(PropertyType.Stat, stat);
	return Math.min(Math.max(value, 0), 30);
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

characterSchema.method("getHitType", function getHitType(armourClass: number, modifier: number) {
	const roll = Game.d20;
	const hitValue = Math.round(roll + modifier + this.hitBonus);
	const critValue = Math.round(roll + this.critBonus);
	if (critValue >= 20) {
		return HitType.Crit;
	} else if (hitValue >= armourClass) {
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
	const modifier = Game.getModifier(this.stats.strength) ?? 0;
	const bonusMultiplier = this.getDamageBonus(DamageType.Crushing) / 100 + 1;
	const hitType = this.getHitType(effectTarget.armourClass, modifier);
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
		value: Math.max(value, 0),
		hitType,
	};
});

characterSchema.method(
	"getWeaponDamage",
	function getWeaponDamage({ effect, effectTarget }: IEffectData, weapon: IWeaponDataWithID) {
		const weaponEffect = effect as IWeaponDamageEffectData;
		const damage = Game.dx(weapon.min, weapon.max);
		const stat = Game.getWeaponStat(weapon.weaponType as WeaponType);
		const modifier = Game.getModifier(this.stats[stat]) ?? 0;
		const isMainhand = weapon.slot === EquipmentSlot.Hand1;
		const damageModifier = isMainhand ? modifier : 0;
		const bonusMultiplier = this.getDamageBonus(weapon.damageType as DamageType) / 100 + 1;
		const hitType = this.getHitType(effectTarget.armourClass, modifier);
		const hitMultiplier = Game.getHitMultiplier(hitType);
		const resistance = effectTarget.getResistance(weapon.damageType) / 100;
		const bleedMuliplier = effectTarget.isBleeding ? 1.5 : 1;
		const value = Math.round(
			(damage + damageModifier) *
				weaponEffect.multiplier *
				bonusMultiplier *
				hitMultiplier *
				bleedMuliplier *
				(1 - resistance),
		);

		return {
			target: effect.target,
			type: weapon.damageType,
			value: Math.max(value, 0),
			hitType,
			weapon: weapon.id,
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

characterSchema.method("getDamage", function getDamage({ effect, effectTarget, source }: IEffectData) {
	const damageEffect = effect as IDamageEffectData;
	const damage = Game.dx(damageEffect.min, damageEffect.max);
	const stat = source.skillClass ? Game.getDamageStat(source.skillClass) : null;
	const modifier = Game.getModifier(this.stats[stat]) ?? 0;
	const bonusMultiplier = this.getDamageBonus(damageEffect.damageType) / 100 + 1;
	const resistance = effectTarget.getResistance(damageEffect.damageType) / 100;
	const value = Math.round((damage + modifier) * bonusMultiplier * (1 - resistance));

	return {
		target: effect.target,
		type: damageEffect.damageType,
		value: Math.max(value, 0),
		hitType: HitType.Hit,
	};
});

characterSchema.method("getHeal", function getHeal({ effect, source }: IEffectData) {
	const healEffect = effect as IHealEffectData;
	const heal = Game.dx(healEffect.min, healEffect.max);
	const stat = source.skillClass ? Game.getDamageStat(source.skillClass) : null;
	const modifier = Game.getModifier(this.stats[stat]) ?? 0;
	const value = heal + modifier;
	return {
		target: healEffect.target,
		value: Math.max(value, 0),
	};
});

characterSchema.method("getStatus", function getStatus({ effect, effectTarget, source }: IEffectData) {
	const statusEffect = effect as IStatusEffectData;

	let saved = false;
	if (statusEffect.modifier && statusEffect.difficulty) {
		const modifier = Game.getModifier(effectTarget.stats[statusEffect.modifier]);
		const roll = Game.d20 + modifier;
		saved = roll >= statusEffect.difficulty;
	}

	// Add 1 for self-targeted effects to account for the current turn
	const remaining = statusEffect.target === Target.Self ? statusEffect.duration + 1 : statusEffect.duration;

	return {
		source,
		target: statusEffect.target,
		properties: statusEffect.properties,
		remaining,
		duration: statusEffect.duration,
		saved,
		modifier: statusEffect.modifier,
		difficulty: statusEffect.difficulty,
	};
});

characterSchema.method("getAuxiliary", function getAuxiliary({ effect, effectTarget, source }: IEffectData) {
	const auxiliaryEffect = effect as IAuxiliaryEffectData;

	let saved = false;
	if (auxiliaryEffect.modifier && auxiliaryEffect.difficulty) {
		const modifier = Game.getModifier(effectTarget.stats[auxiliaryEffect.modifier]);
		const roll = Game.d20 + modifier;
		saved = roll >= auxiliaryEffect.difficulty;
	}

	// Add 1 for self-targeted effects to account for the current turn
	const remaining = auxiliaryEffect.target === Target.Self ? auxiliaryEffect.duration + 1 : auxiliaryEffect.duration;

	return {
		source,
		target: auxiliaryEffect.target,
		effect: auxiliaryEffect.effect,
		remaining,
		duration: auxiliaryEffect.duration,
		saved,
		modifier: auxiliaryEffect.modifier,
		difficulty: auxiliaryEffect.difficulty,
	};
});

characterSchema.method("createEmptyAction", function createEmptyAction(data: ITurnData, name: string) {
	const action: IAction = {
		self: data.self.name,
		enemy: data.enemy.name,
		skill: {
			name,
			weaponDamage: new Types.DocumentArray<IDamageEffect[]>([]),
			damage: new Types.DocumentArray<IDamageEffect>([]),
			heal: new Types.DocumentArray<IHealEffect>([]),
			status: new Types.DocumentArray<IStatusEffect>([]),
			auxiliary: new Types.DocumentArray<IAuxiliaryEffect>([]),
		},
		weapon: new Types.DocumentArray<IActionWeaponEffect>([]),
		activeEffects: data.self.activeAuxiliaryEffects,
	};

	return action;
});

characterSchema.method("createAction", function createAction(data: ITurnData) {
	if (data.skill === "potion") {
		if (this.potions <= 0) {
			throw new Error("No potions left");
		}

		const action: IAction = this.createEmptyAction(data, "Potion");

		if (this.isStunned) {
			return action;
		}

		this.potions--;

		action.skill.heal.push({
			target: Target.Self,
			value: Math.round(this.maxHitPoints / 2),
		});

		return action;
	}

	const skill = this.skills.find((sk) => sk.id === data.skill);

	if (!skill) {
		throw new Error("Skill is not available");
	}

	if (skill.maxUses > 0 && skill.remaining <= 0) {
		throw new Error("No uses remaining for this skill");
	}

	const action: IAction = this.createEmptyAction(data, skill.name);

	if (this.isStunned) {
		return action;
	}

	if (skill.maxUses > 0) {
		this.skillIDs.find((sk) => sk.id === data.skill).remaining--;
	}

	const skillSource = { id: skill.id, name: skill.name, icon: skill.icon, skillClass: skill.class };

	skill.effects.forEach((effect) => {
		const effectTarget = effect.target === Target.Self ? data.self : data.enemy;
		const effectData = { effect, effectTarget, source: skillSource };

		switch (effect.type) {
			case EffectType.WeaponDamage:
				action.skill.weaponDamage.push(this.getWeaponsDamage(effectData));
				break;
			case EffectType.Damage:
				action.skill.damage.push(this.getDamage(effectData));
				break;
			case EffectType.Heal:
				action.skill.heal.push(this.getHeal(effectData));
				break;
			case EffectType.Status:
				action.skill.status.push(this.getStatus(effectData));
				break;
			case EffectType.Auxiliary:
				action.skill.auxiliary.push(this.getAuxiliary(effectData));
				break;
		}
	});

	for (const effects of action.skill.weaponDamage) {
		effects.forEach((effect) => {
			if (effect.hitType === HitType.Miss) {
				return;
			}

			const weapon = this.weaponsAsArray.find((weapon) => weapon.id === effect.weapon);

			if (!weapon) {
				return;
			}

			const weaponEffects: IActionWeaponEffect = {
				name: weapon.name,
				damage: new Types.DocumentArray<IDamageEffect>([]),
				heal: new Types.DocumentArray<IHealEffect>([]),
				status: new Types.DocumentArray<IStatusEffect>([]),
				auxiliary: new Types.DocumentArray<IAuxiliaryEffect>([]),
			};

			const source = { id: weapon.id, name: weapon.name, icon: weapon.icon };

			weapon.effects?.forEach((effect) => {
				const effectTarget = effect.target === Target.Self ? data.self : data.enemy;
				const effectData = { effect, effectTarget, source };

				switch (effect.type) {
					case EffectType.Damage:
						weaponEffects.damage.push(this.getDamage(effectData));
						break;
					case EffectType.Heal:
						weaponEffects.heal.push(this.getHeal(effectData));
						break;
					case EffectType.Status:
						weaponEffects.status.push(this.getStatus(effectData));
						break;
					case EffectType.Auxiliary:
						weaponEffects.auxiliary.push(this.getAuxiliary(effectData));
						break;
				}
			});

			action.weapon.push(weaponEffects);
		});
	}

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

	const existingStatusEffect = this.activeStatusEffects.find(({ source }) => source.id === status.source.id);
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
	const allEffects = [action.skill, ...action.weapon];

	allEffects.forEach((effects) => {
		if ("weaponDamage" in effects) {
			effects.weaponDamage.forEach((effects) => {
				effects.forEach((effect) => {
					if (effect.target === target) {
						this.handleDamage(effect);
					}
				});
			});
		}
		if ("damage" in effects) {
			effects.damage.forEach((effect) => {
				if (effect.target === target) {
					this.handleDamage(effect);
				}
			});
		}
		if ("heal" in effects) {
			effects.heal.forEach((effect) => {
				if (effect.target === target) {
					this.handleHeal(effect);
				}
			});
		}
		if ("status" in effects) {
			effects.status.forEach((effect) => {
				if (effect.target === target) {
					this.handleStatus(effect);
				}
			});
		}
		if ("auxiliary" in effects) {
			effects.auxiliary.forEach((effect) => {
				if (effect.target === target) {
					this.handleAuxiliary(effect);
				}
			});
		}
	});
});

characterSchema.method("tickPoison", function tickPoison(damageBonus: number) {
	if (this.isPoisoned) {
		const bonusMultiplier = damageBonus / 100 + 1;
		const resistance = this.getResistance(DamageType.Poison) / 100;
		const value = Math.round((this.maxHitPoints / 8) * bonusMultiplier * (1 - resistance));
		const damage = Math.max(value, 0);
		this.setHitPoints(this.baseHitPoints - damage);
	}
});

characterSchema.method("tickEffects", function tickEffects() {
	const updatedStatusEffects = this.activeStatusEffects
		.map((effect) => ({ ...effect, remaining: effect.remaining - 1 }))
		.filter((effect) => effect.remaining > 0);
	const updatedAuxiliaryEffects = this.activeAuxiliaryEffects
		.map((effect) => ({ ...effect, remaining: effect.remaining - 1 }))
		.filter((effect) => effect.remaining > 0);

	this.set("activeStatusEffects", updatedStatusEffects);
	this.set("activeAuxiliaryEffects", updatedAuxiliaryEffects);

	this.checkConstitution();
});

const CharacterModel = model<ICharacter, ICharacterModel>("Character", characterSchema);
const CharacterArchive = model<ICharacter, ICharacterModel>("CharacterArchive", characterSchema);

export { CharacterModel, CharacterArchive };
export default CharacterModel;
