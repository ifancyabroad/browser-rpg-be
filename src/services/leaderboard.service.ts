import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { HeroArchive } from "@models/hero.model";
import { Session, SessionData } from "express-session";
import { ILeaderboardQuery } from "@common/types/leaderboard";
import { IUser } from "@common/types/user";

export async function getLeaderboard(leaderboardQuery: ILeaderboardQuery, session: Session & Partial<SessionData>) {
	const { showUserCharacters } = leaderboardQuery;
	const { user } = session;

	try {
		const filter = JSON.parse(showUserCharacters) ? { user: user.id } : {};

		const leaderboard = await HeroArchive.find(filter)
			.sort({ maxBattleLevel: "desc", name: "asc" })
			.limit(10)
			.populate<{ user: IUser }>("user", "username")
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
					username: hero.user.username,
					isUser: hero.user.id === user.id.toString(),
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
