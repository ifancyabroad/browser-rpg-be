import { Model, model } from "mongoose";
import { Schema } from "mongoose";

interface IUser {
	email: string;
	password: string;
}

// Add methods here
interface IUserMethods {
	// fullName(): string;
}

// Add static methods here
interface IUserModel extends Model<IUser, {}, IUserMethods> {
	// createWithFullName(name: string): Promise<HydratedDocument<IUser, IUserMethods>>;
}

const userSchema = new Schema<IUser, IUserModel, IUserMethods>(
	{
		email: {
			type: String,
			lowercase: true,
			unique: true,
			required: [true, "Please enter an email"],
		},
		password: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

const UserModel = model<IUser, IUserModel>("User", userSchema);

export { UserModel };
export default UserModel;
