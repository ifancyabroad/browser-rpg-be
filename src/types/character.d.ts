import { Request } from "express";
import { Session, SessionData } from "express-session";
import { EquipmentSlot, State, Status } from "@utils/enums/index";

export interface ISkill {
	id: string;
	remaining: number;
}

export interface IHistory {
	enemy: string;
	level: number;
	day: number;
	defeated: boolean;
}

export interface IStats {
	strength: number;
	dexterity: number;
	constitution: number;
	intelligence: number;
	wisdom: number;
	charisma: number;
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

export interface ICharacter {
	id: string;
	user: string;
	name: string;
	characterClass: string;
	status: Status;
	state: State;
	experience: number;
	level: number;
	gold: number;
	day: number;
	skills: ISkill[];
	history: IHistory[];
	availableItems: string[];
	equipment: IEquipment;
	hitPoints: number;
	maxHitPoints: number;
	stats: IStats;
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

export interface ICharacterService {
	getActiveCharacter: (session: Session & Partial<SessionData>) => Promise<any>;
	retireActiveCharacter: (session: Session & Partial<SessionData>) => Promise<any>;
	createCharacter: (characterInput: ICharacterInput, session: Session & Partial<SessionData>) => Promise<any>;
	buyItem: (item: IBuyItemInput, session: Session & Partial<SessionData>) => Promise<any>;
	rest: (session: Session & Partial<SessionData>) => Promise<any>;
}
