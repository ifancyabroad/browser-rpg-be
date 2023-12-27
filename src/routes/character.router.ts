import { Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestUser } from "@common/types/user";
import {
	buyItem,
	createCharacter,
	getActiveCharacter,
	levelUp,
	move,
	nextLevel,
	rest,
	retireActiveCharacter,
} from "@services/character.service";
import { RequestCharacter, RequestItem, RequestLevelUp, RequestMove } from "@common/types/character";
import { CharacterCreateDto } from "@common/validation/character";
import { GameData } from "@common/utils/game/GameData";

const characterRouter = Router();

// @GET '/character'
// @DEST Get active character
characterRouter.get(
	"/",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
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
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const character = await retireActiveCharacter(req.session);
		res.json({ character });
	}),
);

// @GET '/character/classes'
// @DEST Get available classes for character create
characterRouter.get(
	"/classes",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
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

// @POST '/character/rest'
// @DEST Rest at the tavern
characterRouter.post(
	"/rest",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
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

// @POST '/character/move'
// @DEST Level up your character
characterRouter.post(
	"/move",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestMove, res: Response) => {
		const character = await move(req.body, req.session);
		res.json({ character });
	}),
);

// @POST '/character/nextLevel'
// @DEST Proceed to the next dungeon level
characterRouter.post(
	"/nextLevel",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const character = await nextLevel(req.session);
		res.json({ character });
	}),
);

export { characterRouter };
export default characterRouter;
