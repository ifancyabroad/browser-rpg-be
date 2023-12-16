import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import HeroModel from "@models/hero.model";

export async function getLeaderboard() {
	try {
		const leaderboard = await HeroModel.find().sort({ kills: "desc", name: "asc" }).limit(20);
		if (!leaderboard) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No characters found");
		}

		return { leaderboard };
	} catch (error) {
		console.error(`Error getLeaderboard: ${error.message}`);
		throw error;
	}
}
