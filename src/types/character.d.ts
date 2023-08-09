import { Request } from "express";
import { Session, SessionData } from "express-session";
import { CharacterClass, State, Status } from "enums";

export interface ISkill {
	skill: string;
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
	head: string | null;
	neck: string | null;
	body: string | null;
	waist: string | null;
	hands: string | null;
	feet: string | null;
	finger1: string | null;
	finger2: string | null;
	hand1: string | null;
	hand2: string | null;
}

export interface ICharacter {
	id: string;
	user: string;
	name: string;
	characterClass: CharacterClass;
	status: Status;
	state: State;
	experience: number;
	level: number;
	gold: number;
	day: number;
	skills: ISkill[];
	history: IHistory[];
	equipment: IEquipment;
	hitPoints: number;
	stats: IStats;
}

export interface ICharacterInput {
	id?: string;
	name: string;
	characterClass: CharacterClass;
}

export interface RequestCharacter extends Request {
	character?: ICharacterInput;
}

export interface ICharacterService {
	getActiveCharacter: (session: Session & Partial<SessionData>) => Promise<any>;
	retireActiveCharacter: (session: Session & Partial<SessionData>) => Promise<any>;
	createCharacter: (characterInput: ICharacterInput, session: Session & Partial<SessionData>) => Promise<any>;
}
