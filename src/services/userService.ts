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
				console.log("Warning loginUser: InValid credentials");
				throw createHttpError(httpStatus.FORBIDDEN, "Invalid  credentials");
			}
			// Check password
			const isMatch = await bcrypt.compare(userInput.password, userCheck.password);
			if (!isMatch) {
				console.log("Warning loginUser: InValid credentials");
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
				console.error(`Error loginUser: ${error.message}`);
				throw createHttpError(httpStatus.FORBIDDEN, "loginUser: Error jsonwebtoken");
			}
		} catch (error) {
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

			// Return password
			const payload = {
				user: {
					id: userRecord.id,
				},
			};
			const jwtSecret = process.env.JWT_SECRET;
			try {
				const token = jwt.sign(payload, jwtSecret, { expiresIn: "2h" });
				console.log("Success registerUser");
				return token;
			} catch (error) {
				console.error(`Error registerUser: ${error.message}`);
				throw createHttpError(httpStatus.FORBIDDEN, "RegisterUser: Error jsonwebtoken");
			}
		} catch (error) {
			console.error(`Error registerUser: ${error.message}`);
			throw error;
		}
	}
}
