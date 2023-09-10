import { Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestUser } from "types/user";
import { Container } from "typedi";
import { CharacterService } from "@services/characterService";
import { RequestCharacter } from "types/character";
import { CharacterCreateDto } from "@validation/character";
import { GameDataService } from "@game/services/gameDataService";

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
	expressAsyncHandler(async (req: RequestCharacter, res: Response) => {
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
		const gameDataService = Container.get(GameDataService);
		const classes = await gameDataService.getClasses();
		res.json({ classes });
	}),
);

export { characterRouter };
export default characterRouter;
