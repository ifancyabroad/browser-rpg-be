import { Model, Types } from "mongoose";
import { ICharacter, ICharacterMethods } from "./character";
import { IHero } from "./hero";
import { ISkillDataWithID } from "./gameData";
import { DamageType, Tactics, Zone } from "@common/utils";

export interface IEnemy extends ICharacter {
	image: string;
	challenge: number;
	zone: Zone;
	boss: boolean;
	hero: boolean;
	username?: string;
	tactics: Tactics;
	naturalArmourClass: number;
	naturalMinDamage: number;
	naturalMaxDamage: number;
	naturalDamageType: DamageType;
}

export interface IEnemyMethods extends ICharacterMethods {
	// Add virtuals here
	nameWithDeterminer: string;

	// Add methods here
	getSkill(hero: IHero): ISkillDataWithID;
}

// Add static methods here
export interface IEnemyModel extends Model<IEnemy, {}, IEnemyMethods> {
	// createWithFullName(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}
