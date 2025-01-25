import { IHistoryQuery, IStatsQuery } from "@common/types/stats";
import { FINAL_LEVEL, GameData, Status } from "@common/utils";
import { HeroArchive } from "@models/hero.model";
import { Session, SessionData } from "express-session";
import createHttpError from "http-errors";
import httpStatus from "http-status-codes";
import mongoose, { SortOrder } from "mongoose";

export async function getOverall(statsQuery: IStatsQuery, session: Session & Partial<SessionData>) {
	const { characterClass } = statsQuery;
	const { user } = session;
	try {
		const userId = new mongoose.Types.ObjectId(user.id);
		let filter: Record<string, unknown> = { user: userId };

		if (characterClass && characterClass !== "all") {
			const classData = GameData.getClasses().find((c) => c.name.toLowerCase() === characterClass);
			if (!classData) {
				throw createHttpError(httpStatus.BAD_REQUEST, `Character class not found: ${characterClass}`);
			}
			filter.characterClassID = classData.id;
		}

		const [stats] = await HeroArchive.aggregate([
			{ $match: filter },
			{
				$group: {
					_id: "$user",
					heroes: { $sum: 1 },
					kills: { $sum: "$kills" },
					deaths: { $sum: { $cond: [{ $eq: ["$status", Status.Dead] }, 1, 0] } },
					record: { $max: "$kills" },
					victories: { $sum: { $cond: [{ $gte: ["$kills", FINAL_LEVEL] }, 1, 0] } },
				},
			},
		]);

		const topHero = await HeroArchive.findOne(filter)
			.sort({ maxBattleLevel: "desc", day: "asc", gold: "desc" })
			.lean();

		if (!stats || !topHero) {
			return null;
		}

		return {
			heroes: stats.heroes,
			kills: stats.kills,
			deaths: stats.deaths,
			record: stats.record,
			victories: stats.victories,
			topHero: {
				id: topHero._id,
				name: topHero.name,
			},
		};
	} catch (error) {
		console.error(`Error getOverall: ${error.message}`);
		throw error;
	}
}

const SORT_OPTIONS = new Map<string, string>([
	["name", "name"],
	["level", "level"],
	["characterClass", "characterClassID"],
	["kills", "kills"],
	["day", "day"],
	["status", "status"],
	["updatedAt", "updatedAt"],
]);

export async function getHistory(historyQuery: IHistoryQuery, session: Session & Partial<SessionData>) {
	const { page = 0, limit = 10, sort = "updatedAt", order = "desc" } = historyQuery;
	const { user } = session;
	const pageNumber = Number(page);
	const limitNumber = Number(limit);
	const skip = pageNumber * limitNumber;
	try {
		const sortOption = SORT_OPTIONS.get(sort) || SORT_OPTIONS.get("updatedAt");
		const sortFilter: Record<string, SortOrder> = {
			[sortOption]: order,
		};

		if (sortOption !== "updatedAt") {
			sortFilter.updatedAt = "desc";
		}

		const allCharacters = await HeroArchive.find({ user: user.id })
			.sort(sortFilter)
			.skip(skip)
			.limit(limitNumber)
			.lean();

		if (!allCharacters) {
			throw createHttpError(httpStatus.BAD_REQUEST, "No characters found");
		}

		const totalCharacters = await HeroArchive.countDocuments({ user: user.id });

		const characterClasses = GameData.getClasses();

		const history = allCharacters.map((character) => {
			const characterClass = characterClasses.find(({ id }) => id === character.characterClassID);

			return {
				id: character._id,
				name: character.name,
				level: character.level,
				kills: character.kills,
				day: character.day,
				status: character.status,
				characterClass: characterClass.name,
				updatedAt: character.updatedAt,
			};
		});

		return { history, count: totalCharacters, page: pageNumber };
	} catch (error) {
		console.error(`Error getHistory: ${error.message}`);
		throw error;
	}
}
