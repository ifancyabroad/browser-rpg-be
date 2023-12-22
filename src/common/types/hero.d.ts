import { Model, Types } from "mongoose";
import { ICharacter, ICharacterMethods } from "./character";
import { EquipmentSlot, Stat, State } from "@common/utils";
import { IClassDataWithID, ISkillDataWithID, TEquipmentDataWithID } from "./gameData";
import { IReward } from "./battle";

export interface ILevelUp {
	level: number;
	skills: Types.Array<string>;
}

export interface ILevelUpData {
	level: number;
	skills: Types.Array<ISkillDataWithID>;
}

export interface IHero extends ICharacter {
	user: Types.ObjectId;
	map: Types.ObjectId;
	characterClassID: string;
	state: State;
	experience: number;
	gold: number;
	day: number;
	kills: number;
	availableItemIDs: Types.Array<string>;
	levelUp?: ILevelUp;
	slainBy?: string;
}

export interface IHeroMethods extends ICharacterMethods {
	// Add virtuals here
	get availableItems(): Types.DocumentArray<TEquipmentDataWithID>;
	get characterClass(): IClassDataWithID;
	get restPrice(): number;
	get nextLevelExperience(): number;
	get levelUpData(): ILevelUpData;
	get goldMultiplier(): number;

	// Add methods here
	addExperience(xp: number): void;
	addLevel(stat: Stat, skill?: string): void;
	rest(): void;
	buyItem(id: string, slot: EquipmentSlot): void;
	battleWon(reward: IReward): void;
	battleLost(name: string): void;

	checkLevelUp(): void;
}

// Add static methods here
export interface IHeroModel extends Model<IHero, {}, IHeroMethods> {
	// createWithFullName(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}
