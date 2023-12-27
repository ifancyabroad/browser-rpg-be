import { RoomState, RoomType } from "@common/utils";
import { Model, Types } from "mongoose";

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

export interface IMap {
	maps: Types.DocumentArray<TMap>;
	location: ILocation;
}

export interface IMapMethods {
	// Add virtuals here
	get level(): TMap;
	get room(): IRoom;
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
}

// Add static methods here
export interface IMapModel extends Model<IMap, {}, IMapMethods> {
	// createWithFullName(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}
