import { Service } from "typedi";
import { IGameDataService } from "types/gameData";
import data from "@data/gameData.json";
import { getMultipleRandom, mapToArray } from "@utils/helpers";
import { ICharacter, IEquipment, ISkill } from "types/character";
import { EQUIPMENT_LEVELS } from "@utils/constants";

/* Game Data service */
@Service()
export class GameDataService implements IGameDataService {
	constructor() {}

	public getClasses() {
		try {
			const { classes } = data;
			return mapToArray(classes);
		} catch (error) {
			console.error(`Error getClasses: ${error.message}`);
			throw error;
		}
	}

	public getCharacterClassById(id: string) {
		try {
			const { classes } = data;
			const classData = classes[id as keyof typeof classes];
			if (!classData) {
				throw new Error(`Class Data not found for ${id}`);
			}
			return classData;
		} catch (error) {
			console.error(`Error getCharacterClassByName: ${error.message}`);
			throw error;
		}
	}

	public populateClass(id: string) {
		return {
			id,
			...this.getCharacterClassById(id),
		};
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

	public populateSkills(skills: ISkill[]) {
		return skills.map(({ id, remaining }) => ({
			id,
			remaining,
			...this.getSkillById(id),
		}));
	}

	public getEquipmentById(id: string) {
		try {
			const { armours, weapons } = data;
			const equipment = Object.assign(armours, weapons);
			const equipmentData = equipment[id as keyof typeof equipment];
			if (!equipmentData) {
				throw new Error(`Equipment Data not found for ${id}`);
			}
			return equipmentData;
		} catch (error) {
			console.error(`Error getEquipmentById: ${error.message}`);
			throw error;
		}
	}

	public populateEquipment(equipment: IEquipment) {
		const equipmentArray = Object.entries(equipment).map(([k, v]) =>
			v ? [k, { id: v, ...this.getEquipmentById(v) }] : [k, v],
		);
		return Object.fromEntries(equipmentArray);
	}

	public getShopItems(classID: string, level: number) {
		try {
			const { armours, weapons } = data;
			const characterClass = this.getCharacterClassById(classID);
			const maxItemLevel = EQUIPMENT_LEVELS.get(level);

			const filteredArmours = mapToArray(armours)
				.filter(({ armourType }) => characterClass.armourTypes.includes(armourType))
				.filter(({ level }) => maxItemLevel >= level)
				.map(({ id }) => id);
			const armourItems = getMultipleRandom(filteredArmours, 3);

			const filteredWeapons = mapToArray(weapons)
				.filter(({ weaponType }) => characterClass.weaponTypes.includes(weaponType))
				.filter(({ level }) => maxItemLevel >= level)
				.map(({ id }) => id);
			const weaponItems = getMultipleRandom(filteredWeapons, 2);

			return armourItems.concat(weaponItems);
		} catch (error) {
			console.error(`Error getShopItems: ${error.message}`);
			throw error;
		}
	}

	public populateAvailableItems(items: string[]) {
		return items.map((id) => ({
			id,
			...this.getEquipmentById(id),
		}));
	}
}
