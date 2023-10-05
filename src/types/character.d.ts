import { Request } from "express";
import { Session, SessionData } from "express-session";
import { EquipmentSlot, Stat, State, Status } from "@utils/enums/index";

export interface ISkill {
	id: string;
	remaining: number;
}

export interface IStats {
	strength: number;
	dexterity: number;
	constitution: number;
	intelligence: number;
	wisdom: number;
	charisma: number;
}

export interface IResistances {
	slashing: number;
	crushing: number;
	piercing: number;
	cold: number;
	fire: number;
	lighting: number;
	radiant: number;
	necrotic: number;
	poison: number;
	acid: number;
}

export interface IEquipment {
	[EquipmentSlot.Head]: string | null;
	[EquipmentSlot.Neck]: string | null;
	[EquipmentSlot.Body]: string | null;
	[EquipmentSlot.Waist]: string | null;
	[EquipmentSlot.Hands]: string | null;
	[EquipmentSlot.Feet]: string | null;
	[EquipmentSlot.Finger1]: string | null;
	[EquipmentSlot.Finger2]: string | null;
	[EquipmentSlot.Hand1]: string | null;
	[EquipmentSlot.Hand2]: string | null;
}

export interface ILevelUp {
	level: number;
	skills: string[];
}

export interface ICharacter {
	id: string;
	name: string;
	status: Status;
	level: number;
	skills: ISkill[];
	equipment: IEquipment;
	hitPoints: number;
	maxHitPoints: number;
	stats: IStats;
	resistances: IResistances;
}

export interface IHero extends ICharacter {
	user: string;
	characterClass: string;
	state: State;
	experience: number;
	gold: number;
	day: number;
	kills: number;
	slainBy?: string;
	availableItems: string[];
	levelUp?: ILevelUp;
}

export interface ICharacterInput {
	id?: string;
	name: string;
	characterClass: string;
}

export interface RequestCharacter extends Request {
	character?: ICharacterInput;
}

export interface IBuyItemInput {
	id: string;
	slot: EquipmentSlot;
}

export interface RequestItem extends Request {
	item: IBuyItemInput;
}

export interface ILevelUpInput {
	stat: Stat;
	skill?: string;
}

export interface RequestLevelUp extends Request {
	levelUp: ILevelUpInput;
}

export interface ICharacterService {
	getActiveCharacter: (session: Session & Partial<SessionData>) => Promise<any>;
	retireActiveCharacter: (session: Session & Partial<SessionData>) => Promise<any>;
	createCharacter: (characterInput: ICharacterInput, session: Session & Partial<SessionData>) => Promise<any>;
}
