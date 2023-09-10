import { Service } from "typedi";
import { IGameDataService } from "types/gameData";
import data from "@data/gameData.json";

/* Game Data service */
@Service()
export class GameDataService implements IGameDataService {
	constructor() {}

	public getClasses() {
		try {
			const { classes } = data;
			return Object.keys(classes).map((id) => ({
				...classes[id as keyof typeof classes],
				id,
			}));
		} catch (error) {
			console.error(`Error getClasses: ${error.message}`);
			throw error;
		}
	}

	public getCharacterClassByName(name: string) {
		try {
			const { classes } = data;
			const classData = Object.values(classes).find(({ skillClass }) => skillClass === name);
			if (!classData) {
				throw new Error(`Class Data not found for ${name}`);
			}
			return classData;
		} catch (error) {
			console.error(`Error getCharacterClassByName: ${error.message}`);
			throw error;
		}
	}

	public getSkillById(id: string) {
		try {
			const { skills } = data;
			const skillData = skills[id as keyof typeof skills];
			if (!skillData) {
				throw new Error(`Skill Data not found for ${id}`);
			}
			return skillData;
		} catch (error) {
			console.error(`Error getSkillById: ${error.message}`);
			throw error;
		}
	}
}
