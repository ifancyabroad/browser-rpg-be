import { IContactInput } from "@common/types/contact";
import { Session, SessionData } from "express-session";
import { sendMail } from "./mailer.service";
import UserModel from "@models/user.model";

export async function sendContactForm(contactInput: IContactInput, session: Session & Partial<SessionData>) {
	const { email, subject, body } = contactInput;
	const { user } = session;
	try {
		const userModel = await UserModel.findById(user.id);

		if (!userModel) {
			throw new Error("User not found");
		}

		const mailOptions = {
			from: "noreply@browserheroes.com",
			to: "info@browserheroes.com",
			subject: subject,
			text: `${body}\n\nFrom: ${userModel.email}\n\nReply to: ${email}`,
		};

		await sendMail(mailOptions);
	} catch (error) {
		console.error(`Error sendContactForm: ${error.message}`);
		throw error;
	}
}
