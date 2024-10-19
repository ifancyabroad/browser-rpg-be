import { IContactInput } from "@common/types/contact";
import { Session, SessionData } from "express-session";
import { sendMail } from "./mailer.service";

export async function sendContactForm(contactInput: IContactInput, session: Session & Partial<SessionData>) {
	const { email, subject, body } = contactInput;
	try {
		const mailOptions = {
			from: "noreply@browserheroes.com",
			to: "info@browserheroes.com",
			subject: subject,
			text: `${body}\n\nFrom: ${email}`,
		};

		await sendMail(mailOptions);
	} catch (error) {
		console.error(`Error sendContactForm: ${error.message}`);
		throw error;
	}
}
