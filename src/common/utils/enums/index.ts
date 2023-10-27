export enum EffectType {
	WeaponDamage = "weaponDamage",
	Damage = "damage",
	Heal = "heal",
	Status = "status",
	Auxiliary = "auxiliary",
}

export enum Target {
	Self = "self",
	Ally = "ally",
	Enemy = "enemy",
}

export enum AuxiliaryEffect {
	Poison = "poison",
	Stun = "stun",
	Bleed = "bleed",
	Disarm = "disarm",
}

export enum Status {
	Alive = "alive",
	Dead = "dead",
	Retired = "retired",
}

export enum State {
	Idle = "idle",
	Battle = "battle",
}

export enum BattleState {
	Active = "active",
	Won = "won",
	Lost = "lost",
}

export enum SkillClass {
	Common = "common",
	Unique = "unique",
	Warrior = "warrior",
	Rogue = "rogue",
	Mage = "mage",
	Cleric = "cleric",
}

export enum Stat {
	Strength = "strength",
	Dexterity = "dexterity",
	Constitution = "constitution",
	Intelligence = "intelligence",
	Wisdom = "wisdom",
	Charisma = "charisma",
}

export enum AuxiliaryStat {
	Defence = "defence",
	HitChance = "hitChance",
	CritChance = "critChance",
	HitPoints = "hitPoints",
}

export enum DamageType {
	Slashing = "slashing",
	Crushing = "crushing",
	Piercing = "piercing",
	Cold = "cold",
	Fire = "fire",
	Lighting = "lighting",
	Radiant = "radiant",
	Necrotic = "necrotic",
	Poison = "poison",
	Acid = "acid",
}

export enum WeaponType {
	Axe = "axe",
	Bow = "bow",
	Club = "club",
	Crossbow = "crossbow",
	Dagger = "dagger",
	Hammer = "hammer",
	Mace = "mace",
	Spear = "spear",
	Staff = "staff",
	Sword = "sword",
}

export enum WeaponSize {
	OneHanded = "oneHanded",
	TwoHanded = "twoHanded",
}

export enum EquipmentType {
	Amulet = "amulet",
	Armour = "armour",
	Belt = "belt",
	Boots = "boots",
	Gloves = "gloves",
	Helmet = "helmet",
	Ring = "ring",
	Shield = "shield",
	Weapon = "weapon",
}

export enum EquipmentSlot {
	Head = "head",
	Neck = "neck",
	Body = "body",
	Hands = "hands",
	Finger1 = "finger1",
	Finger2 = "finger2",
	Waist = "waist",
	Feet = "feet",
	Hand1 = "hand1",
	Hand2 = "hand2",
}

export enum PropertyType {
	Stat = "stat",
	AuxiliaryStat = "auxiliaryStat",
	Resistance = "resistance",
	Damage = "damage",
}

export enum ArmourType {
	Heavy = "heavy",
	Medium = "medium",
	Light = "light",
	Miscellaneous = "misc",
}

export enum HitType {
	Hit = "hit",
	Crit = "crit",
	Miss = "miss",
}
