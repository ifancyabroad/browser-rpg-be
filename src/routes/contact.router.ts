import { Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestContact } from "@common/types/contact";
import { sendContactForm } from "@services/contact.service";
import { ContactDto } from "@common/validation/contact";

const contactRouter = Router();

// @POST '/auth'
// @DEST POST contact form
contactRouter.post(
	"/",
	middleware.userAuth,
	middleware.validation(ContactDto),
	expressAsyncHandler(async (req: RequestContact, res: Response) => {
		await sendContactForm(req.body, req.session);
		res.status(200).json({ message: "Contact form sent" });
	}),
);

export { contactRouter };
export default contactRouter;
