import { Request, Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestMessage } from "@common/types/message";
import { MessageDto } from "@common/validation/message";
import { getUserMessage, postUserMessage } from "@services/message.service";

const messageRouter = Router();

// @POST '/message'
// @DEST POST a message
messageRouter.post(
	"/",
	middleware.userAuth,
	middleware.validation(MessageDto),
	expressAsyncHandler(async (req: RequestMessage, res: Response) => {
		const message = await postUserMessage(req.body, req.session);
		res.json({ message });
	}),
);

// @GET '/message'
// @DESC Get message from yesterday's top hero
messageRouter.get(
	"/",
	middleware.userAuth,
	expressAsyncHandler(async (req: Request, res: Response) => {
		const message = await getUserMessage(req.session);
		res.json({ message });
	}),
);

export { messageRouter };
export default messageRouter;
