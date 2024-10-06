import nodemailer, { SendMailOptions } from "nodemailer";
import * as aws from "@aws-sdk/client-ses";
import "dotenv/config";

const ses = new aws.SES({
	apiVersion: "2010-12-01",
	region: process.env.AWS_REGION,
	credentials: {
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	},
});

// create Nodemailer SES transporter
const transporter = nodemailer.createTransport({
	SES: { ses, aws },
	sendingRate: 1,
});

// verify connection is working
transporter.verify(function (error, success) {
	if (error) {
		console.error(error);
	} else {
		console.info("Server is ready to take our messages");
	}
});

export async function sendMail(options: SendMailOptions) {
	try {
		const info = await transporter.sendMail(options);
		console.info("Message sent: %s", info.messageId);
		return info;
	} catch (error) {
		console.error(error);
	}
}
