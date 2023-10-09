import { Session, SessionData } from "express-session";
import { ICharacter } from "./character";
import { AuxiliaryEffect, BattleState, HitType, Stat, Target } from "@common/utils/enums/index";
import { Request } from "express";
import { Character } from "@game/Character";
import { TProperty } from "./property";
import { ObjectId } from "mongoose";

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

export interface IStatusSkill {
	id: string;
	name: string;
	icon: string;
}

export interface IStatus {
	skill: IStatusSkill;
	target: Target;
	properties: TProperty[];
	remaining: number;
	duration: number;
	saved: boolean;
	modifier?: Stat;
	difficulty?: number;
}

export interface IAuxiliary {
	skill: IStatusSkill;
	target: Target;
	effect: AuxiliaryEffect;
	remaining: number;
	duration: number;
	saved: boolean;
	modifier?: Stat;
	difficulty?: number;
}

export interface IAction {
	skill: string;
	self: string;
	enemy: string;
	weaponDamage: IDamage[][];
	damage: IDamage[];
	heal: IHeal[];
	status: IStatus[];
	auxiliary: IAuxiliary[];
}

export interface IReward {
	gold: number;
	experience: number;
}

export interface IBattle extends Document {
	id: string;
	user: string;
	character: ObjectId;
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
