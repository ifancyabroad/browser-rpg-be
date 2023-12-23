import { RoomState, RoomType } from "@common/utils";
import { Model, Types } from "mongoose";

export interface IRoom {
	state: RoomState;
	type: RoomType;
}

type TMapRow = Types.DocumentArray<IRoom>;

type TMap = Types.DocumentArray<TMapRow>;

export interface ILocation {
	level: number;
	x: number;
	y: number;
}

export interface IMap {
	maps: Types.DocumentArray<TMap>;
	location: ILocation;
}

export interface IMapMethods {
	// Add virtuals here
	get level(): TMap;
	get room(): IRoom;

	// Add methods here
	findPath(location: ILocation): number[][];
	move(location: ILocation): void;
	completeRoom(): void;
}

// Add static methods here
export interface IMapModel extends Model<IMap, {}, IMapMethods> {
	// createWithFullName(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}
