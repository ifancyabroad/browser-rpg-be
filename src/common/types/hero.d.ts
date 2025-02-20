import { Document, Model, Types } from "mongoose";
import { ICharacter, ICharacterMethods } from "./character";
import { EquipmentSlot, Stat, State } from "@common/utils";
import { IClassDataWithID, ISkillDataWithID, TEquipmentDataWithID } from "./gameData";
import { IBattle, IBattleMethods } from "./battle";

export interface ILevelUp {
	level: number;
	skills: Types.Array<string>;
}

export interface ILevelUpData {
	level: number;
	skills: Types.Array<ISkillDataWithID>;
}

export interface ISalvage {
	value: number;
	claimed: boolean;
}

export interface IHero extends ICharacter {
	user: Types.ObjectId;
	characterClassID: string;
	state: State;
	maxBattleLevel: number;
	experience: number;
	gold: number;
	day: number;
	kills: number;
	availableItemIDs: Types.Array<string>;
	restockCount: number;
	levelUp?: ILevelUp;
	slainBy?: string;
	salvage?: ISalvage;
	spiritsDisabled: boolean;
}

export interface IHeroMethods extends ICharacterMethods {
	// Add virtuals here
	get availableItems(): Types.DocumentArray<TEquipmentDataWithID>;
	get characterClass(): IClassDataWithID;
	get currentLevelExperience(): number;
	get nextLevelExperience(): number;
	get levelUpData(): ILevelUpData;
	get discountMultiplier(): number;
	get restockPrice(): number;
	get restPrice(): number;
	get potionPrice(): number;
	get disableSpiritsPrice(): number;
	get isTwoHandedWeaponEquipped(): boolean;
	get shopLevel(): number;
	get goldValue(): number;
	get salvageValue(): number;

	// Add methods here
	addExperience(xp: number): void;
	addLevel(stat: Stat, skill?: string): void;
	rest(): void;
	restock(): void;
	buyItem(id: string): void;
	checkItem(id: string, slot: EquipmentSlot): void;
	equipItem(id: string, slot: EquipmentSlot): void;
	buyPotion(quantity: number): void;
	swapWeapons(): void;
	battleWon(battle: IBattle & IBattleMethods): void;
	battleLost(name: string): void;
	checkLevelUp(): void;
}

// Add static methods here
export interface IHeroModel extends Model<IHero, {}, IHeroMethods> {
	// createWithFullName(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}

export type THeroDocument = Document<unknown, {}, IHero> &
	Omit<
		IHero & {
			_id: Types.ObjectId;
		},
		keyof IHeroMethods
	> &
	IHeroMethods;
