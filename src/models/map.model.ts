import { IMapLocation, IMap, IMapMethods, IMapModel, ITreasure } from "@common/types/map";
import { GameData, RoomState, RoomType } from "@common/utils";
import { Model, model } from "mongoose";
import { Schema } from "mongoose";
import { AStarFinder } from "astar-typescript";
import { locationSchema } from "./location.model";

const treasureSchema = new Schema<ITreasure, Model<ITreasure>>(
	{
		itemIDs: {
			type: [String],
			required: true,
		},
		location: {
			type: locationSchema,
			required: true,
		},
	},
	{ _id: false },
);

const mapSchema = new Schema<IMap, IMapModel, IMapMethods>(
	{
		levels: {
			type: [[[Number]]],
			required: true,
			immutable: true,
		},
		location: {
			type: locationSchema,
			required: true,
		},
		treasureIDs: {
			type: [treasureSchema],
			required: true,
		},
		completedRooms: {
			type: [locationSchema],
			required: true,
		},
	},
	{ toJSON: { virtuals: true } },
);

mapSchema.virtual("maps").get(function () {
	return this.levels.map((map, level) =>
		map.map((row, y) =>
			row.map((type, x) => {
				const location = { level, x, y };
				const state = this.getRoomState(location, type);
				return { location, type, state };
			}),
		),
	);
});

mapSchema.virtual("level").get(function () {
	return this.maps[this.location.level];
});

mapSchema.virtual("room").get(function () {
	return this.level[this.location.y][this.location.x];
});

mapSchema.virtual("treasure").get(function () {
	return this.treasureIDs.map(({ location, itemIDs }) => {
		const items = GameData.populateAvailableItems(itemIDs);
		return { location, items };
	});
});

mapSchema.virtual("isBattle").get(function () {
	return this.room.type === RoomType.Battle && this.room.state !== RoomState.Complete;
});

mapSchema.virtual("isBoss").get(function () {
	return this.room.type === RoomType.Boss && this.room.state !== RoomState.Complete;
});

mapSchema.virtual("isShop").get(function () {
	return this.room.type === RoomType.Shop && this.room.state !== RoomState.Complete;
});

mapSchema.virtual("isTreasure").get(function () {
	return this.room.type === RoomType.Treasure && this.room.state !== RoomState.Complete;
});

mapSchema.virtual("isRest").get(function () {
	return this.room.type === RoomType.Rest && this.room.state !== RoomState.Complete;
});

mapSchema.virtual("isExit").get(function () {
	return this.room.type === RoomType.Exit && this.room.state !== RoomState.Complete;
});

mapSchema.method("findPath", function findPath(destination: IMapLocation) {
	const matrix = this.level.map((row, y) =>
		row.map(({ state }, x) => {
			if (y === destination.y && x === destination.x) {
				return 0;
			}
			return state === RoomState.Blocking ? 1 : 0;
		}),
	);
	const aStarInstance = new AStarFinder({
		grid: { matrix },
		diagonalAllowed: false,
	});
	const startPos = { x: this.location.x, y: this.location.y };
	const goalPos = { x: destination.x, y: destination.y };
	return aStarInstance.findPath(startPos, goalPos);
});

mapSchema.method("move", function move(location: IMapLocation) {
	const path = this.findPath(location);
	if (!path.length) {
		throw new Error("No path found");
	}
	this.location = location;
});

mapSchema.method("completeRoom", function completeRoom() {
	this.completedRooms.push(this.location);
	this.markModified("completedRooms");
});

mapSchema.method("getIsRoomComplete", function getIsRoomComplete(location: IMapLocation) {
	return this.completedRooms.some(
		(completed) => completed.level === location.level && completed.x === location.x && completed.y === location.y,
	);
});

mapSchema.method("getRoomState", function getRoomState(location: IMapLocation, type: RoomType) {
	if (this.getIsRoomComplete(location)) {
		return RoomState.Complete;
	}

	const blockingRooms = [RoomType.Battle, RoomType.Boss, RoomType.None, RoomType.Wall];
	return blockingRooms.includes(type) ? RoomState.Blocking : RoomState.Idle;
});

mapSchema.method("nextLevel", function nextLevel() {
	this.location = GameData.getStartingLocation(this.levels, this.location.level + 1);
});

mapSchema.method("getTreasure", function getTreasure(location) {
	return this.treasureIDs.find(
		(treasure) =>
			treasure.location.level === location.level &&
			treasure.location.x === location.x &&
			treasure.location.y === location.y,
	);
});

mapSchema.method("createTreasure", function createTreasure(location, classID) {
	if (this.getTreasure(location)) {
		throw new Error("Treasure already exists!");
	}

	const itemIDs = GameData.getClassItems(classID, location.level + 2, 2);
	const treasure = { itemIDs, location };
	this.treasureIDs.push(treasure);
});

const MapModel = model<IMap, IMapModel>("Map", mapSchema);

export { MapModel };
export default MapModel;
