import bcrypt from "bcrypt";
import User from "../models/user";
import httpStatus from "http-status-codes";
import createHttpError from "http-errors";
import { IUserInput } from "../types/user";
import jwt from "jsonwebtoken";

export const loginUser = async (userInput: IUserInput) => {
    try {
        // Get user from db
        const userCheck = await User.findOne({ email: userInput.email });
        if (!userCheck) {
            throw createHttpError(httpStatus.FORBIDDEN, "Invalid  credentials");
        }
        // Check password
        const isMatch = await bcrypt.compare(userInput.password, userCheck.password);
        if (!isMatch) {
            throw createHttpError(httpStatus.FORBIDDEN, "Invalid  credentials");
        }

        //Return jsonwebtoken
        const payload = {
            user: {
                id: userCheck.id,
            },
        };

        const jwtSecret = process.env.JWT_SECRET;
        try {
            const token = jwt.sign(payload, jwtSecret, { expiresIn: "2h" });
            return token;
        } catch (error) {
            throw createHttpError(httpStatus.FORBIDDEN, "loginUser: Error jsonwebtoken");
        }
    } catch (error) {
        throw error;
    }
};

export const registerUser = async (userInput: IUserInput) => {
    const { email, password } = userInput;
    try {
        const userCheck = await User.findOne({ email });
        if (userCheck) {
            throw createHttpError(httpStatus.CONFLICT, `A user with email ${email} already exists`);
        }
        // Encrypting password
        const salt = await bcrypt.genSalt(10);
        const encryptPass = await bcrypt.hash(password, salt);
        const userRecord = await User.create({
            email: email,
            password: encryptPass,
        });

        // Return password
        const payload = {
            user: {
                id: userRecord.id,
            },
        };
        const jwtSecret = process.env.JWT_SECRET;
        try {
            const token = jwt.sign(payload, jwtSecret, { expiresIn: "2h" });
            return token;
        } catch (error) {
            throw createHttpError(httpStatus.FORBIDDEN, "RegisterUser: Error jsonwebtoken");
        }
    } catch (error) {
        throw error;
    }
};
