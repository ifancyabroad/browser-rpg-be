import { ILocation, IMap, IMapMethods, IMapModel, IRoom } from "@common/types/map";
import { RoomState, RoomType } from "@common/utils";
import { Model, model } from "mongoose";
import { Schema } from "mongoose";
import { AStarFinder } from "astar-typescript";

const roomSchema = new Schema<IRoom, Model<IRoom>>({
	state: {
		type: String,
		enum: RoomState,
		required: true,
	},
	type: {
		type: Number,
		enum: RoomType,
		required: true,
	},
});

const locationSchema = new Schema<ILocation, Model<ILocation>>({
	level: {
		type: Number,
		required: true,
	},
	x: {
		type: Number,
		required: true,
	},
	y: {
		type: Number,
		required: true,
	},
});

const mapSchema = new Schema<IMap, IMapModel, IMapMethods>(
	{
		maps: {
			type: [[[roomSchema]]],
			required: true,
		},
		location: {
			type: locationSchema,
			required: true,
		},
	},
	{ timestamps: true },
);

mapSchema.virtual("level").get(function () {
	return this.maps[this.location.level];
});

mapSchema.method("findPath", function findPath(destination: ILocation) {
	const matrix = this.level.map((row) => row.map(({ state }) => (state === RoomState.Blocking ? 1 : 0)));
	const aStarInstance = new AStarFinder({
		grid: { matrix },
		diagonalAllowed: false,
	});
	const startPos = { x: this.location.x, y: this.location.y };
	const goalPos = { x: destination.x, y: destination.y };
	return aStarInstance.findPath(startPos, goalPos);
});

mapSchema.method("move", function move(location: ILocation) {
	const path = this.findPath(location);
	if (!path.length) {
		throw new Error("No path found");
	}
	this.location = location;
});

const MapModel = model<IMap, IMapModel>("Map", mapSchema);

export { MapModel };
export default MapModel;
