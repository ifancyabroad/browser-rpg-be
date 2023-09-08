import { Service, Inject } from "typedi";
import { config } from "@config/index";
import nodemailer, { SendMailOptions } from "nodemailer";
import * as aws from "@aws-sdk/client-ses";

@Service()
export class MailerService {
	private transporter: nodemailer.Transporter;

	constructor(@Inject("mailerService") private mailerService: typeof nodemailer) {}

	async createConnection() {
		const ses = new aws.SES({
			apiVersion: "2010-12-01",
			region: config.emails.region,
			credentials: {
				secretAccessKey: config.emails.secretAccessKey,
				accessKeyId: config.emails.accessKeyId,
			},
		});

		this.transporter = this.mailerService.createTransport({
			SES: { ses, aws },
			sendingRate: 1,
		});
	}

	async sendMail(options: SendMailOptions) {
		try {
			const info = await this.transporter.sendMail(options);
			console.info("Message sent: %s", info.messageId);
			return info;
		} catch (error) {
			console.error(error);
		}
	}

	async verifyConnection() {
		this.transporter.verify(function (error, success) {
			if (error) {
				console.error(error);
			} else {
				console.info("Server is ready to take our messages");
			}
		});
	}
}
