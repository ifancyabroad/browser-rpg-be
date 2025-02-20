import { Request, Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import {
	buyItem,
	buyPotion,
	createCharacter,
	disableSpirits,
	getActiveCharacter,
	getCharacterByID,
	getDailyWinner,
	levelUp,
	rest,
	restockItems,
	retireActiveCharacter,
	salvage,
	swapWeapons,
} from "@services/character.service";
import { RequestCharacter, RequestItem, RequestLevelUp, RequestPotion } from "@common/types/character";
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

// @POST '/character/buyPotion'
// @DEST Buy a potion from the potion seller
characterRouter.post(
	"/buyPotion",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestPotion, res: Response) => {
		const character = await buyPotion(req.body, req.session);
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

// @POST '/character/swapWeapons'
// @DEST Swap weapons in your character's hands
characterRouter.post(
	"/swapWeapons",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const character = await swapWeapons(req.session);
		res.json({ character });
	}),
);

// @POST '/character/salvage'
// @DEST Salvage gold from your last character
characterRouter.post(
	"/salvage",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const character = await salvage(req.session);
		res.json({ character });
	}),
);

// @POST '/character/disableSpirits'
// @DEST Disable spirits for the day
characterRouter.post(
	"/disableSpirits",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const character = await disableSpirits(req.session);
		res.json({ character });
	}),
);

// @GET '/character/dailyWinner'
// @DEST Get the daily winner
characterRouter.get(
	"/dailyWinner",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const character = await getDailyWinner(req.session);
		res.json({ character });
	}),
);

// @GET '/character/:id'
// @DEST Get character by ID
characterRouter.get(
	"/:id",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const character = await getCharacterByID(req.session, req.params.id);
		res.json({ character });
	}),
);

export { characterRouter };
export default characterRouter;
