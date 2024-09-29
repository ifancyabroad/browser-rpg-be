import { Request, Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import {
	buyItem,
	createCharacter,
	getActiveCharacter,
	levelUp,
	rest,
	restockItems,
	retireActiveCharacter,
} from "@services/character.service";
import { RequestCharacter, RequestItem, RequestLevelUp } from "@common/types/character";
import { CharacterCreateDto } from "@common/validation/character";
import { GameData } from "@common/utils/game/GameData";

const characterRouter = Router();

// @GET '/character'
// @DEST Get active character
characterRouter.get(
	"/",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const character = await getActiveCharacter(req.session);
		res.json({ character });
	}),
);

// @PUT '/character/create'
// @DEST Create new character
characterRouter.put(
	"/create",
	middleware.userAuth,
	middleware.validation(CharacterCreateDto),
	expressAsyncHandler(async (req: RequestCharacter, res: Response) => {
		const character = await createCharacter(req.body, req.session);
		res.json({ character });
	}),
);

// @POST '/character/retire'
// @DEST Retire character
characterRouter.post(
	"/retire",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const character = await retireActiveCharacter(req.session);
		res.json({ character });
	}),
);

// @GET '/character/classes'
// @DEST Get available classes for character create
characterRouter.get(
	"/classes",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const classes = GameData.getClasses();
		res.json({ classes });
	}),
);

// @POST '/character/buy'
// @DEST Buy an item from the shop
characterRouter.post(
	"/buy",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestItem, res: Response) => {
		const character = await buyItem(req.body, req.session);
		res.json({ character });
	}),
);

// @POST '/character/restock'
// @DEST Restock the shop
characterRouter.post(
	"/restock",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const character = await restockItems(req.session);
		res.json({ character });
	}),
);

// @POST '/character/rest'
// @DEST Rest at the tavern
characterRouter.post(
	"/rest",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const character = await rest(req.session);
		res.json({ character });
	}),
);

// @POST '/character/levelup'
// @DEST Level up your character
characterRouter.post(
	"/levelup",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestLevelUp, res: Response) => {
		const character = await levelUp(req.body, req.session);
		res.json({ character });
	}),
);

export { characterRouter };
export default characterRouter;
