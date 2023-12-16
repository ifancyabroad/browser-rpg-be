import { Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestUser } from "@common/types/user";
import { getLeaderboard } from "@services/leaderboard.service";

const leaderboardRouter = Router();

// @GET '/leaderboard'
// @DEST Get leaderboards
leaderboardRouter.get(
	"/",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const leaderboard = await getLeaderboard();
		res.json(leaderboard);
	}),
);

export { leaderboardRouter };
export default leaderboardRouter;
