import { Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestUser } from "types/user";
import { Container } from "typedi";
import { CharacterService } from "@services/characterService";
import { RequestCharacter, RequestItem } from "types/character";
import { CharacterCreateDto } from "@validation/character";
import { GameData } from "@game/GameData";

const characterRouter = Router();

// @GET '/character'
// @DEST Get active character
characterRouter.get(
	"/",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const characterService = Container.get(CharacterService);
		const character = await characterService.getActiveCharacter(req.session);
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
		const characterService = Container.get(CharacterService);
		const character = await characterService.createCharacter(req.body, req.session);
		res.json({ character });
	}),
);

// @POST '/character/retire'
// @DEST Retire character
characterRouter.post(
	"/retire",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const characterService = Container.get(CharacterService);
		const character = await characterService.retireActiveCharacter(req.session);
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
		const characterService = Container.get(CharacterService);
		const character = await characterService.buyItem(req.body, req.session);
		res.json({ character });
	}),
);

// @POST '/character/rest'
// @DEST Rest at the tavern
characterRouter.post(
	"/rest",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const characterService = Container.get(CharacterService);
		const character = await characterService.rest(req.session);
		res.json({ character });
	}),
);

export { characterRouter };
export default characterRouter;
