import { model, Types } from "mongoose";
import { Schema } from "mongoose";

interface IMessage {
	user: Types.ObjectId;
	message: string;
}

const messageSchema = new Schema<IMessage>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		message: {
			type: String,
			required: true,
			minlength: 1,
			maxlength: 1000,
		},
	},
	{ timestamps: true },
);

const MessageModel = model<IMessage>("Message", messageSchema);

export { MessageModel };
export default MessageModel;
