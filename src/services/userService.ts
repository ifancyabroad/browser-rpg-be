import mongoose from "mongoose";
import { IUser, IUserInput, IUserService } from "src/types/user";
import { Inject, Service } from "typedi";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/* User service */
@Service()
export class UserService implements IUserService {
	constructor(@Inject("userModel") private userModel: mongoose.Model<IUser & mongoose.Document>) {}

	public async loginUser(userInput: IUserInput) {
		try {
			// Get user from db
			const userCheck = await this.userModel.findOne({ email: userInput.email });
			if (!userCheck) {
				console.log("Warning loginUser: Invalid credentials");
				throw createHttpError(httpStatus.FORBIDDEN, "Invalid  credentials");
			}
			// Check password
			const isMatch = await bcrypt.compare(userInput.password, userCheck.password);
			if (!isMatch) {
				console.log("Warning loginUser: Invalid credentials");
				throw createHttpError(httpStatus.FORBIDDEN, "Invalid  credentials");
			}

			// Remove password
			const payload = {
				id: userCheck.id,
				email: userCheck.email,
			};

			return payload;
		} catch (error) {
			console.error(`Error loginUser: ${error.message}`);
			throw error;
		}
	}

	public async registerUser(userInput: IUserInput) {
		const { email, password } = userInput;
		try {
			const userCheck = await this.userModel.findOne({ email });
			if (userCheck) {
				throw createHttpError(httpStatus.CONFLICT, `A user with email ${email} already exists`);
			}
			// Encrypting password
			const salt = await bcrypt.genSalt(10);
			const encryptPass = await bcrypt.hash(password, salt);
			const userRecord = await this.userModel.create({
				email: email,
				password: encryptPass,
			});

			// Remove password
			const payload = {
				id: userRecord.id,
				email: userRecord.email,
			};

			return payload;
		} catch (error) {
			console.error(`Error registerUser: ${error.message}`);
			throw error;
		}
	}
}
