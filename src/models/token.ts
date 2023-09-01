import mongoose, { Schema } from "mongoose";

const tokenSchema = new Schema({
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

const TokenModel = mongoose.model("Token", tokenSchema);

export { TokenModel };
export default TokenModel;
