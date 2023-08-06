import { Request } from "express";
import { Session, SessionData } from "express-session";
import { CharacterClass, Status } from "src/enums/character";

export interface ICharacter {
	id: string;
	userId: string;
	name: string;
	characterClass: CharacterClass;
	status: Status;
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
	createCharacter: (characterInput: ICharacterInput, session: Session & Partial<SessionData>) => Promise<any>;
}
