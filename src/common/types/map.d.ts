import { RoomState, RoomType } from "@common/utils";
import { Request } from "express";
import { Model, Types } from "mongoose";
import { TEquipmentDataWithID } from "./gameData";

export interface ILocation {
	x: number;
	y: number;
}

export interface IMapLocation extends ILocation {
	level: number;
}

export interface IRoom {
	state: RoomState;
	type: RoomType;
	location: IMapLocation;
}

type TMapRow = Types.Array<IRoom>;

type TMap = Types.Array<TMapRow>;

export interface ITreasure {
	itemIDs: Types.Array<string>;
	location: IMapLocation;
}

export interface IPopulatedTreasure {
	items: TEquipmentDataWithID;
	location: IMapLocation;
}

type TLevelRow = Types.Array<RoomType>;

type TLevel = Types.Array<TLevelRow>;

export interface IMap {
	levels: Types.Array<TLevel>;
	location: IMapLocation;
	treasureIDs: Types.DocumentArray<ITreasure>;
	completedRooms: Types.DocumentArray<IMapLocation>;
}

export interface IMapMethods {
	// Add virtuals here
	get maps(): Types.DocumentArray<TMap>;
	get level(): TMap;
	get room(): IRoom;
	get treasure(): Types.DocumentArray<IPopulatedTreasure>;
	get isBattle(): boolean;
	get isBoss(): boolean;
	get isShop(): boolean;
	get isTreasure(): boolean;
	get isRest(): boolean;
	get isExit(): boolean;
	get isFinalLevel(): boolean;

	// Add methods here
	findPath(location: IMapLocation): number[][];
	move(location: IMapLocation): void;
	completeRoom(): void;
	getIsRoomComplete(location: IMapLocation): boolean;
	getRoomState(location: IMapLocation, type: RoomType): RoomState;
	nextLevel(): void;
	getTreasure(location: IMapLocation): (Types.Subdocument<Types.ObjectId> & ITreasure) | undefined;
	createTreasure(location: IMapLocation, classID: string): void;
}

// Add static methods here
export interface IMapModel extends Model<IMap, {}, IMapMethods> {
	// createWithFullName(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}

export interface RequestMove extends Request {
	location: IMapLocation;
}
