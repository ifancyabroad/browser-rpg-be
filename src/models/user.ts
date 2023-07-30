import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
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

export default mongoose.model("User", userSchema);
