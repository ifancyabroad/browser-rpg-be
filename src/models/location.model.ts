import { IMapLocation } from "@common/types/map";
import { Model, Schema } from "mongoose";

export const locationSchema = new Schema<IMapLocation, Model<IMapLocation>>(
	{
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
	},
	{ _id: false },
);
