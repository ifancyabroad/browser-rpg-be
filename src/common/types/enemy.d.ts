import { Model, Types } from "mongoose";
import { ICharacter, ICharacterMethods } from "./character";
import { IHero } from "./hero";
import { ISkillDataWithID } from "./gameData";

export interface IEnemy extends ICharacter {
	image: string;
	challenge: number;
}

export interface IEnemyMethods extends ICharacterMethods {
	// Add virtuals here
	get rating(): number;

	// Add methods here
	getSkill(hero: IHero): ISkillDataWithID;
}

// Add static methods here
export interface IEnemyModel extends Model<IEnemy, {}, IEnemyMethods> {
	// createWithFullName(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}
