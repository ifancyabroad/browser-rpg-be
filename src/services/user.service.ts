import { IGuestInput, IRequestResetPasswordInput, IResetPasswordInput, IUserInput } from "@common/types/user";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import * as crypto from "crypto";
import { UserModel } from "@models/user.model";
import TokenModel from "@models/token.model";
import { sendMail } from "./mailer.service";
import { Session, SessionData } from "express-session";

export async function loginUser(userInput: IUserInput) {
	try {
		// Get user from db
		const userCheck = await UserModel.findOne({ email: userInput.email });
		if (!userCheck) {
			throw createHttpError(httpStatus.FORBIDDEN, "Email does not exist, please register");
		}
		// Check password
		const isMatch = await bcrypt.compare(userInput.password, userCheck.password);
		if (!isMatch) {
			throw createHttpError(httpStatus.FORBIDDEN, "Password is incorrect");
		}

		// Remove password
		const payload = {
			id: userCheck.id,
			username: userCheck.username,
			email: userCheck.email,
		};

		return payload;
	} catch (error) {
		console.error(`Error loginUser: ${error.message}`);
		throw error;
	}
}

export async function registerUser(userInput: IUserInput, session: Session & Partial<SessionData>) {
	const { username, email, password } = userInput;
	const { user } = session;
	try {
		const userCheck = await UserModel.findOne({ email });
		if (userCheck) {
			throw createHttpError(httpStatus.CONFLICT, `A user with email ${email} already exists`);
		}
		// Encrypting password
		const salt = await bcrypt.genSalt(10);
		const encryptPass = await bcrypt.hash(password, salt);

		// Convert guest to user
		if (user && user.id) {
			const userRecord = await UserModel.findById(user.id);

			if (!userRecord) {
				throw createHttpError(httpStatus.CONFLICT, "Valid user not found");
			}

			if (userRecord.email) {
				throw createHttpError(httpStatus.CONFLICT, "User already has an email");
			}

			const newRecord = await userRecord.set({ username, email, password: encryptPass }).save();

			// Remove password
			const payload = {
				id: newRecord.id,
				username: newRecord.username,
				email: newRecord.email,
			};

			return payload;
		}

		const userRecord = await UserModel.create({ username, email, password: encryptPass });

		// Remove password
		const payload = {
			id: userRecord.id,
			username: userRecord.username,
			email: userRecord.email,
		};

		return payload;
	} catch (error) {
		console.error(`Error registerUser: ${error.message}`);
		throw error;
	}
}

export async function registerGuest(guestInput: IGuestInput) {
	const { username } = guestInput;
	try {
		const guestCheck = await UserModel.findOne({
			username,
			email: { $exists: false },
		});
		if (guestCheck) {
			throw createHttpError(httpStatus.CONFLICT, `A guest with username ${username} already exists`);
		}

		const guestRecord = await UserModel.create({ username });
		const payload = {
			id: guestRecord.id,
			username: guestRecord.username,
		};

		return payload;
	} catch (error) {
		console.error(`Error registerGuest: ${error.message}`);
		throw error;
	}
}

// Not implemented as we don't store email in the user model
export async function requestResetPassword(requestResetPasswordInput: IRequestResetPasswordInput) {
	const { email } = requestResetPasswordInput;
	try {
		const user = await UserModel.findOne({ email });
		if (!user) {
			throw createHttpError(httpStatus.CONFLICT, `A user with email ${email} does not exist`);
		}

		const token = await TokenModel.findOne({ user: user._id });
		if (token) {
			await token.deleteOne();
		}

		const resetToken = crypto.randomBytes(32).toString("hex");
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(resetToken, salt);

		await TokenModel.create({
			user: user._id,
			token: hash,
			createdAt: Date.now(),
		});

		const link = `${process.env.HOST}/passwordReset?token=${resetToken}&id=${user._id}`;

		sendMail({
			from: "noreply@browserheroes.com",
			to: user.email,
			subject: "Password Reset Request",
			text: `Please reset your password by clicking this link ${link}`,
		});

		return link;
	} catch (error) {
		console.error(`Error requestResetPassword: ${error.message}`);
		throw error;
	}
}

export async function resetPassword(resetPasswordInput: IResetPasswordInput) {
	const { password, token, userId } = resetPasswordInput;
	try {
		const passwordResetToken = await TokenModel.findOne({ userId });

		if (!passwordResetToken) {
			createHttpError(httpStatus.CONFLICT, "Invalid or expired password reset token");
		}

		const isValid = await bcrypt.compare(token, passwordResetToken.token);

		if (!isValid) {
			createHttpError(httpStatus.CONFLICT, "Invalid or expired password reset token");
		}

		const salt = await bcrypt.genSalt(10);
		const encryptPass = await bcrypt.hash(password, salt);

		await UserModel.updateOne({ _id: userId }, { $set: { password: encryptPass } }, { new: true });

		const user = await UserModel.findById(userId);

		sendMail({
			from: "noreply@browserheroes.com",
			to: user.email,
			subject: "Password Reset Successfully",
			text: "Congratulations your password has been successfully reset!",
		});

		await passwordResetToken.deleteOne();

		return { message: "Password reset was successful" };
	} catch (error) {
		console.error(`Error resetPassword: ${error.message}`);
		throw error;
	}
}
