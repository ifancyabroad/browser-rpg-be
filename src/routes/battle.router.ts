import { Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestUser } from "@common/types/user";
import { action, getBattle, returnToTown, startBattle, takeTreasure } from "@services/battle.service";
import { RequestAction, RequestTreasure, RequestZone } from "@common/types/battle";

const battleRouter = Router();

// @POST '/battle/start'
// @DEST Start new battle
battleRouter.post(
	"/start",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestZone, res: Response) => {
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

// @POST '/battle/return'
// @DEST Return to town from active battle
battleRouter.post(
	"/return",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
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
		const character = await takeTreasure(req.body, req.session);
		res.json({ character });
	}),
);

export { battleRouter };
export default battleRouter;
