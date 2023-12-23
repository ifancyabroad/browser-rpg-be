import { ILocation } from "@common/types/map";
import { Model, Schema } from "mongoose";

export const locationSchema = new Schema<ILocation, Model<ILocation>>({
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
