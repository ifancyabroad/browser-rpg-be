import { IZone } from "@common/types/hero";
import { Model, Schema } from "mongoose";

export const zoneSchema = new Schema<IZone, Model<IZone>>(
	{
		name: {
			type: String,
			required: true,
		},
		level: {
			type: Number,
			required: true,
		},
	},
	{ _id: false },
);
