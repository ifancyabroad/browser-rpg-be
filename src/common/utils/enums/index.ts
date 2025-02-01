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
	Silence = "silence",
	Blind = "blind",
	Frenzy = "frenzy",
	Charm = "charm",
	Cripple = "cripple",
}

export enum Status {
	Alive = "alive",
	Dead = "dead",
	Retired = "retired",
	Complete = "complete",
}

export enum State {
	Idle = "idle",
	Battle = "battle",
}

export enum BattleState {
	Active = "active",
	Complete = "complete",
}

export enum BattleResult {
	Won = "won",
	Lost = "lost",
}

export enum SkillClass {
	Common = "common",
	Unique = "unique",
	Warrior = "warrior",
	Barbarian = "barbarian",
	Rogue = "rogue",
	Assassin = "assassin",
	Mage = "mage",
	Warlock = "warlock",
	Cleric = "cleric",
	Occultist = "occultist",
}

export enum CharacterClass {
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
	ArmourClass = "armourClass",
	HitChance = "hitChance",
	CritChance = "critChance",
}

export enum DamageType {
	Slashing = "slashing",
	Crushing = "crushing",
	Piercing = "piercing",
	Cold = "cold",
	Fire = "fire",
	Lightning = "lightning",
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
	Wand = "wand",
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
	Cloth = "cloth",
	Miscellaneous = "misc",
}

export enum HitType {
	Hit = "hit",
	Crit = "crit",
	Miss = "miss",
}

export enum ItemRarity {
	Common = 1,
	Uncommon = 2,
	Rare = 3,
	Epic = 4,
	Legendary = 5,
}

export enum Zone {
	Forest = "forest",
	Castle = "castle",
	Desert = "desert",
	Plains = "plains",
	Hills = "hills",
	Ocean = "ocean",
	Volcano = "volcano",
	Abyss = "abyss",
	Dungeon = "dungeon",
	Tower = "tower",
}

export enum Tactics {
	Default = "default",
	Caster = "caster",
	Concede = "concede",
}
