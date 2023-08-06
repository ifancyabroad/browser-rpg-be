import { Container } from "typedi";
import { IModelDI } from "src/types/dependencyInjectors";
import UserModel from "src/models/users";
import CharacterModel from "src/models/character";
import BattleModel from "src/models/battle";

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
];

const dependencyInjector = async (): Promise<void> => {
	try {
		models.forEach((m) => {
			Container.set(m.name, m.model);
		});
	} catch (error) {
		console.error(`Error on dependency injector loader: ${error}`);
		throw error;
	}
};

export { dependencyInjector };
export default dependencyInjector;
