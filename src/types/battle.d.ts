import { Session, SessionData } from "express-session";
import { ICharacter, IEquipment, ISkill, IStats } from "./character";
import { BattleState, Status } from "@utils/enums/index";
import { Request } from "express";

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

export interface IEnemy {
	id: string;
	name: string;
	image: string;
	status: Status;
	level: number;
	skills: ISkill[];
	equipment: IEquipment;
	hitPoints: number;
	maxHitPoints: number;
	stats: IStats;
	resistances: IResistances;
}

export interface IDamage {
	type: string;
	value: number;
}

export interface ITurn {}

export interface IBattle {
	id: string;
	user: string;
	character: ICharacter;
	enemy: IEnemy;
	turns: ITurn[];
	state: BattleState;
}

export interface IBattleInput {
	id: string;
}

export interface RequestAction extends Request {
	skill: IBattleInput;
}

export interface IBattleService {
	startBattle: (session: Session & Partial<SessionData>) => Promise<any>;
}
