import { ILocation, IMap, IMapMethods, IMapModel, IRoom } from "@common/types/map";
import { RoomState, RoomType } from "@common/utils";
import { Model, model } from "mongoose";
import { Schema } from "mongoose";

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

const MapModel = model<IMap, IMapModel>("Map", mapSchema);

export { MapModel };
export default MapModel;
