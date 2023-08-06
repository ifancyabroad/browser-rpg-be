import { Response, Router } from "express";
import { middleware } from "src/middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestUser } from "src/types/user";
import { Container } from "typedi";
import { BattleService } from "src/services/battleService";

const battleRouter = Router();

// @POST '/battle'
// @DEST Start new battle
battleRouter.post(
	"/start",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const battleService = Container.get(BattleService);
		const battle = await battleService.startBattle(req.session);
		res.json({ battle });
	}),
);

export { battleRouter };
export default battleRouter;
