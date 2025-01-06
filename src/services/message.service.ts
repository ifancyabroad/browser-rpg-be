import { IMessageInput } from "@common/types/message";
import { HeroArchive } from "@models/hero.model";
import MessageModel from "@models/message.model";
import { Session, SessionData } from "express-session";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";

export async function postUserMessage(messageInput: IMessageInput, session: Session & Partial<SessionData>) {
	const { message } = messageInput;
	const { user } = session;
	try {
		const startDate = new Date();
		startDate.setUTCDate(startDate.getUTCDate() - 1);
		startDate.setUTCHours(0, 0, 0, 0);

		const endDate = new Date();
		endDate.setUTCDate(endDate.getUTCDate() - 1);
		endDate.setUTCHours(23, 59, 59, 999);

		const topHero = await HeroArchive.findOne({ updatedAt: { $gte: startDate, $lte: endDate } })
			.sort({
				maxBattleLevel: "desc",
				day: "asc",
				gold: "desc",
			})
			.lean();

		if (!topHero) {
			return createHttpError(httpStatus.BAD_REQUEST, "No top hero found for yesterday");
		}

		if (topHero.user.toString() !== user.id) {
			throw createHttpError(httpStatus.FORBIDDEN, "You are not the top hero");
		}

		startDate.setUTCDate(startDate.getUTCDate() + 1);
		endDate.setUTCDate(endDate.getUTCDate() + 1);

		const messageRecord = await MessageModel.findOneAndUpdate(
			{
				user: user.id,
				createdAt: { $gte: startDate, $lte: endDate },
			},
			{ user: user.id, message },
			{ upsert: true, new: true },
		);

		return messageRecord;
	} catch (error) {
		console.error(`Error postMessage: ${error.message}`);
		throw error;
	}
}

export const getUserMessage = async (session: Session & Partial<SessionData>) => {
	try {
		const startDate = new Date();
		startDate.setUTCDate(startDate.getUTCDate() - 1);
		startDate.setUTCHours(0, 0, 0, 0);

		const endDate = new Date();
		endDate.setUTCDate(endDate.getUTCDate() - 1);
		endDate.setUTCHours(23, 59, 59, 999);

		const messageRecord = await MessageModel.findOne({
			createdAt: { $gte: startDate, $lte: endDate },
		});

		return messageRecord;
	} catch (error) {
		console.error(`Error getMessage: ${error.message}`);
		throw error;
	}
};
