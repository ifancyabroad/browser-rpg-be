import { Response, Router } from "express";
import { middleware } from "src/middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestUser } from "src/types/user";
import { Container } from "typedi";
import { CharacterService } from "src/services/characterService";
import { CharacterCreateDto, RequestCharacter } from "src/types/character";

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

// @PUT '/character'
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

export { characterRouter };
export default characterRouter;
