import { Model, Schema } from "mongoose";

export interface ISkill {
	id: string;
	remaining: number;
}

export const skillSchema = new Schema<ISkill, Model<ISkill>>(
	{
		id: {
			type: String,
			required: true,
		},
		remaining: {
			type: Number,
			min: 0,
			required: true,
		},
	},
	{ _id: false },
);
