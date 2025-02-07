import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import { HeroArchive } from "@models/hero.model";
import { Session, SessionData } from "express-session";
import { ILeaderboardQuery } from "@common/types/leaderboard";
import { IUser } from "@common/types/user";
import { GameData } from "@common/utils";

export async function getLeaderboard(leaderboardQuery: ILeaderboardQuery, session: Session & Partial<SessionData>) {
	const { type, characterClass, showUserCharacters } = leaderboardQuery;
	const { user } = session;

	try {
		let filter: Record<string, unknown> = {};

		if (type === "user") {
			filter.user = user.id;
		}

		if (type === "daily") {
			const now = new Date();
			const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

			filter.updatedAt = { $gte: startOfDay };
		}

		if (characterClass && characterClass !== "all") {
			const classes = GameData.getClasses();
			const classData = classes.find((c) => c.name.toLowerCase() === characterClass);
			if (!classData) {
				throw createHttpError(httpStatus.BAD_REQUEST, `Character class not found: ${characterClass}`);
			}
			filter.characterClassID = classData.id;
		}

		const leaderboard = await HeroArchive.find(filter)
			.sort({ maxBattleLevel: "desc", day: "asc", gold: "desc" })
			.limit(10)
			.populate<{ user: IUser }>("user", "username")
			.transform((res) =>
				res.map((hero) => ({
					id: hero.id,
					name: hero.name,
					level: hero.level,
					characterClass: {
						name: hero.characterClass.name,
						icon: hero.characterClass.icon,
					},
					slainBy: hero.slainBy,
					status: hero.status,
					kills: hero.kills,
					day: hero.day,
					gold: hero.gold,
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
