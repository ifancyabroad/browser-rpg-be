import { Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestUser } from "types/user";
import { Container } from "typedi";
import { BattleService } from "@services/battleService";
import { RequestAction } from "types/battle";

const battleRouter = Router();

// @POST '/battle/start'
// @DEST Start new battle
battleRouter.post(
	"/start",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const battleService = Container.get(BattleService);
		const battle = await battleService.startBattle(req.session);
		res.json(battle);
	}),
);

// @GET '/battle'
// @DEST Get active battle
battleRouter.get(
	"/",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const battleService = Container.get(BattleService);
		const battle = await battleService.getBattle(req.session);
		res.json(battle);
	}),
);

// @POST '/battle'
// @DEST Complete active battle
battleRouter.post(
	"/complete",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const battleService = Container.get(BattleService);
		const character = await battleService.completeBattle(req.session);
		res.json({ character });
	}),
);

// @POST '/battle/action'
// @DEST Perform an action in active battle
battleRouter.post(
	"/action",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestAction, res: Response) => {
		const battleService = Container.get(BattleService);
		const battle = await battleService.action(req.body, req.session);
		res.json(battle);
	}),
);

export { battleRouter };
export default battleRouter;
