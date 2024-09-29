import { Request, Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { getLeaderboard } from "@services/leaderboard.service";
import { ILeaderboardQuery } from "@common/types/leaderboard";

const leaderboardRouter = Router();

// @GET '/leaderboard'
// @DEST Get leaderboards
leaderboardRouter.get(
	"/",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request<{}, {}, {}, ILeaderboardQuery>, res: Response) => {
		const leaderboard = await getLeaderboard(req.query, req.session);
		res.json(leaderboard);
	}),
);

export { leaderboardRouter };
export default leaderboardRouter;
