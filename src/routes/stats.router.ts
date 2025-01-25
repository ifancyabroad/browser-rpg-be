import { Request, Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { IHistoryQuery, IStatsQuery } from "@common/types/stats";
import { getHistory, getOverall } from "@services/stats.service";

const statsRouter = Router();

// @GET '/character/stats'
// @DEST Get character stats
statsRouter.get(
	"/overall",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request<{}, {}, {}, IStatsQuery>, res: Response) => {
		const overall = await getOverall(req.query, req.session);
		res.json({ overall });
	}),
);

// @GET '/character/history'
// @DEST Get character history
statsRouter.get(
	"/history",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request<{}, {}, {}, IHistoryQuery>, res: Response) => {
		const history = await getHistory(req.query, req.session);
		res.json({ history });
	}),
);

export { statsRouter };
export default statsRouter;
