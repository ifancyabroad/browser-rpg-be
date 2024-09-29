import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import HeroModel from "@models/hero.model";
import { Session, SessionData } from "express-session";
import { ILeaderboardQuery } from "@common/types/leaderboard";

export async function getLeaderboard(leaderboardQuery: ILeaderboardQuery, session: Session & Partial<SessionData>) {
	const { showUserCharacters } = leaderboardQuery;
	const { user } = session;

	try {
		const filter = showUserCharacters ? { user: user.id } : {};

		const leaderboard = await HeroModel.find(filter)
			.sort({ maxBattleLevel: "desc", name: "asc" })
			.limit(10)
			.transform((res) =>
				res.map((hero) => ({
					name: hero.name,
					level: hero.level,
					characterClass: {
						name: hero.characterClass.name,
						icon: hero.characterClass.icon,
					},
					slainBy: hero.slainBy,
					status: hero.status,
					kills: hero.kills,
					maxBattleLevel: hero.maxBattleLevel,
					isUser: hero.user.toString() === user.id.toString(),
				})),
			);
		if (!leaderboard) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No characters found");
		}

		return { leaderboard };
	} catch (error) {
		console.error(`Error getLeaderboard: ${error.message}`);
		throw error;
	}
}
