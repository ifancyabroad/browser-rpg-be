import { Session, SessionData } from "express-session";
import { ICharacter } from "./character";
import { BattleState } from "@utils/enums/index";

export interface IEnemy {}

export interface ITurn {}

export interface IBattle {
	id: string;
	user: string;
	character: ICharacter;
	enemy: IEnemy;
	turns: ITurn[];
	state: BattleState;
}

export interface IBattleService {
	startBattle: (session: Session & Partial<SessionData>) => Promise<any>;
}
