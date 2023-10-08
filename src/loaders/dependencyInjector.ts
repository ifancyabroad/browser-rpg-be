import { Container } from "typedi";
import { IModelDI } from "@common/types/dependencyInjectors";
import UserModel from "@models/users";
import CharacterModel from "@models/character";
import BattleModel from "@models/battle";
import nodemailer from "nodemailer";
import { MailerService } from "@services/mailerService";
import TokenModel from "@models/token";

const models: IModelDI[] = [
	{
		name: "userModel",
		model: UserModel,
	},
	{
		name: "characterModel",
		model: CharacterModel,
	},
	{
		name: "battleModel",
		model: BattleModel,
	},
	{
		name: "tokenModel",
		model: TokenModel,
	},
];

const dependencyInjector = async (): Promise<void> => {
	try {
		models.forEach((m) => {
			Container.set(m.name, m.model);
		});

		Container.set("mailerService", nodemailer);
		Container.get(MailerService).createConnection();
	} catch (error) {
		console.error(`Error on dependency injector loader: ${error}`);
		throw error;
	}
};

export { dependencyInjector };
export default dependencyInjector;
