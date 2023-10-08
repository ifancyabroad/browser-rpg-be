import mongoose, { ObjectId } from "mongoose";
import { IToken, IUser, IUserInput, IUserService } from "@common/types/user";
import { Inject, Service } from "typedi";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import * as crypto from "crypto";
import { MailerService } from "./mailerService";

/* User service */
@Service()
export class UserService implements IUserService {
	constructor(
		@Inject("userModel") private userModel: mongoose.Model<IUser & mongoose.Document>,
		@Inject("tokenModel") private tokenModel: mongoose.Model<IToken & mongoose.Document>,
		@Inject("mailerService") private mailerService: MailerService,
	) {}

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

	public async requestResetPassword(email: string) {
		try {
			const user = await this.userModel.findOne({ email });
			if (!user) {
				throw createHttpError(httpStatus.CONFLICT, `A user with email ${email} does not exist`);
			}

			const token = await this.tokenModel.findOne({ user: user._id });
			if (token) {
				await token.deleteOne();
			}

			const resetToken = crypto.randomBytes(32).toString("hex");
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(resetToken, salt);

			await this.tokenModel.create({
				user: user._id,
				token: hash,
				createdAt: Date.now(),
			});

			const link = `${process.env.HOST}/passwordReset?token=${resetToken}&id=${user._id}`;

			this.mailerService.sendMail({
				from: "noreply@browserheroes.com",
				to: user.email,
				subject: "Password Reset Request",
				text: `Please reset your password by clicking this link ${link}`,
			});

			return link;
		} catch (error) {
			console.error(`Error requesResetPassword: ${error.message}`);
			throw error;
		}
	}

	public async resetPassword(userId: ObjectId, token: string, password: string) {
		const passwordResetToken = await this.tokenModel.findOne({ userId });

		if (!passwordResetToken) {
			createHttpError(httpStatus.CONFLICT, "Invalid or expired password reset token");
		}

		const isValid = await bcrypt.compare(token, passwordResetToken.token);

		if (!isValid) {
			createHttpError(httpStatus.CONFLICT, "Invalid or expired password reset token");
		}

		const salt = await bcrypt.genSalt(10);
		const encryptPass = await bcrypt.hash(password, salt);

		await this.userModel.updateOne({ _id: userId }, { $set: { password: encryptPass } }, { new: true });

		const user = await this.userModel.findById({ _id: userId });

		this.mailerService.sendMail({
			from: "noreply@browserheroes.com",
			to: user.email,
			subject: "Password Reset Successfully",
			text: "Congratulations your password has been successfully reset!",
		});

		await passwordResetToken.deleteOne();

		return { message: "Password reset was successful" };
	}
}
