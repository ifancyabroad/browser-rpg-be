import { Session, SessionData } from "express-session";
import { ICharacter, IHero } from "./character";
import { BattleState, HitType, Target } from "@common/utils/enums/index";
import { Request } from "express";
import { Character } from "@game/Character";

export interface IEnemy extends ICharacter {
	image: string;
	challenge: number;
}

export interface IDamage {
	type: string;
	value: number;
	hitType: HitType;
	target: Target;
}

export interface IHeal {
	value: number;
	target: Target;
}

export interface IAction {
	skill: string;
	self: string;
	enemy: string;
	weaponDamage: IDamage[][];
	damage: IDamage[];
	heal: IHeal[];
	status: any[];
	auxiliary: any[];
}

export interface IReward {
	gold: number;
	experience: number;
}

export interface IBattle {
	id: string;
	user: string;
	character: IHero;
	enemy: IEnemy;
	turns: IAction[][];
	state: BattleState;
	reward?: IReward;
}

export interface IBattleInput {
	id: string;
}

export interface RequestAction extends Request {
	skill: IBattleInput;
}

export interface ITurnData {
	self: Character;
	enemy: Character;
	skill: string;
}

export interface IBattleService {
	startBattle: (session: Session & Partial<SessionData>) => Promise<any>;
}
