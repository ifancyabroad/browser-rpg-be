import { RoomState, RoomType } from "@common/utils";
import { Request } from "express";
import { Model, Types } from "mongoose";
import { TEquipmentDataWithID } from "./gameData";

export interface ILocation {
	level: number;
	x: number;
	y: number;
}

export interface IRoom {
	state: RoomState;
	type: RoomType;
	location: ILocation;
}

type TMapRow = Types.DocumentArray<IRoom>;

type TMap = Types.DocumentArray<TMapRow>;

export interface ITreasure {
	itemIDs: Types.Array<string>;
	location: ILocation;
}

export interface IPopulatedTreasure {
	items: TEquipmentDataWithID;
	location: ILocation;
}

export interface IMap {
	maps: Types.DocumentArray<TMap>;
	location: ILocation;
	treasureIDs: Types.DocumentArray<ITreasure>;
}

export interface IMapMethods {
	// Add virtuals here
	get level(): TMap;
	get room(): IRoom;
	get treasure(): Types.DocumentArray<IPopulatedTreasure>;
	get isBattle(): boolean;
	get isBoss(): boolean;
	get isShop(): boolean;
	get isTreasure(): boolean;
	get isRest(): boolean;
	get isExit(): boolean;

	// Add methods here
	findPath(location: ILocation): number[][];
	move(location: ILocation): void;
	completeRoom(): void;
	nextLevel(): void;
	getTreasure(location: ILocation): (Types.Subdocument<Types.ObjectId> & ITreasure) | undefined;
	createTreasure(location: ILocation, classID: string): void;
}

// Add static methods here
export interface IMapModel extends Model<IMap, {}, IMapMethods> {
	// createWithFullName(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}

export interface RequestMove extends Request {
	location: ILocation;
}
