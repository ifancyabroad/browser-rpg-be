import { Model, Schema, Types, model } from "mongoose";

interface IToken {
	user: Types.ObjectId;
	token: string;
	createdAt: Date;
}

const tokenSchema = new Schema<IToken>({
	user: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	token: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now,
		expires: 900,
	},
});

const TokenModel = model<IToken, Model<IToken>>("Token", tokenSchema);

export { TokenModel };
export default TokenModel;
