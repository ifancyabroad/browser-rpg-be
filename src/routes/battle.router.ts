import { Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestUser } from "@common/types/user";
import { action, getBattle, startBattle } from "@services/battle.service";
import { RequestAction } from "@common/types/battle";
import { RequestMove } from "@common/types/map";

const battleRouter = Router();

// @POST '/battle/start'
// @DEST Start new battle
battleRouter.post(
	"/start",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestMove, res: Response) => {
		const battle = await startBattle(req.body, req.session);
		res.json(battle);
	}),
);

// @GET '/battle'
// @DEST Get active battle
battleRouter.get(
	"/",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const battle = await getBattle(req.session);
		res.json(battle);
	}),
);

// @POST '/battle/action'
// @DEST Perform an action in active battle
battleRouter.post(
	"/action",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestAction, res: Response) => {
		const battle = await action(req.body, req.session);
		res.json(battle);
	}),
);

export { battleRouter };
export default battleRouter;
