import { Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestContact } from "@common/types/contact";
import { sendContactForm } from "@services/contact.service";

const contactRouter = Router();

// @POST '/auth'
// @DEST POST contact form
contactRouter.post(
	"/",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestContact, res: Response) => {
		await sendContactForm(req.body, req.session);
		res.status(200).json({ message: "Contact form sent" });
	}),
);

export { contactRouter };
export default contactRouter;
