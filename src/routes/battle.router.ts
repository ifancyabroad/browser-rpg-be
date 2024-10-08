import { Request, Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { action, getBattle, nextBattle, returnToTown, startBattle, takeTreasure } from "@services/battle.service";
import { RequestAction, RequestTreasure } from "@common/types/battle";

const battleRouter = Router();

// @POST '/battle/start'
// @DEST Start new battle
battleRouter.post(
	"/start",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const battle = await startBattle(req.session);
		res.json(battle);
	}),
);

// @POST '/battle/next'
// @DEST Start next battle
battleRouter.post(
	"/next",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const battle = await nextBattle(req.session);
		res.json(battle);
	}),
);

// @GET '/battle'
// @DEST Get active battle
battleRouter.get(
	"/",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const battle = await getBattle(req.session);
		res.json(battle);
	}),
);

// @POST '/battle/return'
// @DEST Return to town from active battle
battleRouter.post(
	"/return",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const battle = await returnToTown(req.session);
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

// @POST '/character/takeTreasure'
// @DEST Take treasure reward
battleRouter.post(
	"/takeTreasure",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestTreasure, res: Response) => {
		const battle = await takeTreasure(req.body, req.session);
		res.json(battle);
	}),
);

export { battleRouter };
export default battleRouter;
