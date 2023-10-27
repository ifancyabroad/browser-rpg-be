import { IArmourData, IGameData, IWeaponData } from "@common/types/gameData";
import data from "@common/data/gameData.json";
import { getMultipleRandom, getRandomElement, mapToArray } from "@common/utils/helpers";
import { IEquipment, ISkill } from "@common/types/character";
import { EQUIPMENT_LEVELS } from "@common/utils/constants";
import { EquipmentSlot } from "@common/utils/enums";

export class GameData {
	public static getClasses() {
		try {
			const { classes } = data as IGameData;
			return mapToArray(classes);
		} catch (error) {
			console.error(`Error getClasses: ${error.message}`);
			throw error;
		}
	}

	public static getCharacterClassById(id: string) {
		try {
			const { classes } = data as IGameData;
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

	public static populateClass(id: string) {
		return {
			id,
			...this.getCharacterClassById(id),
		};
	}

	public static getSkillById(id: string) {
		try {
			const { skills } = data as IGameData;
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

	public static populateSkillsFromID(skills: string[]) {
		return skills.map((id) => ({
			id,
			...this.getSkillById(id),
		}));
	}

	public static populateSkills(skills: ISkill[]) {
		return skills.map(({ id, remaining }) => ({
			id,
			remaining,
			...this.getSkillById(id),
		}));
	}

	public static getWeaponById(id: string) {
		try {
			const { weapons } = data as IGameData;
			const weaponData = weapons[id as keyof typeof weapons];
			if (!weaponData) {
				throw new Error(`Weapon Data not found for ${id}`);
			}
			return weaponData;
		} catch (error) {
			console.error(`Error getWeaponById: ${error.message}`);
			throw error;
		}
	}

	public static getArmourById(id: string) {
		try {
			const { armours } = data as IGameData;
			const armourData = armours[id as keyof typeof armours];
			if (!armourData) {
				throw new Error(`Armour Data not found for ${id}`);
			}
			return armourData;
		} catch (error) {
			console.error(`Error getArmourById: ${error.message}`);
			throw error;
		}
	}

	public static getEquipmentById(id: string) {
		try {
			const { armours, weapons } = data as IGameData;
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

	public static populateEquipment(equipment: Partial<IEquipment>) {
		const equipmentArray = Object.entries(equipment).map(([k, v]) =>
			v ? [k, { id: v, ...this.getEquipmentById(v) }] : [k, v],
		);
		return Object.fromEntries(equipmentArray) as Record<
			EquipmentSlot,
			(IWeaponData & { id: string }) | (IArmourData & { id: string })
		>;
	}

	public static getShopItems(classID: string, level: number) {
		try {
			const { armours, weapons } = data as IGameData;
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

	public static populateAvailableItems(items: string[]) {
		return items.map((id) => ({
			id,
			...this.getEquipmentById(id),
		}));
	}

	public static getEnemy(day: number) {
		try {
			const { monsters } = data as IGameData;
			const minRating = day - 5;
			const maxRating = day + 5;
			const enemyPool = mapToArray(monsters).filter(
				({ challenge }) => challenge >= minRating && challenge <= maxRating,
			);
			return getRandomElement(enemyPool);
		} catch (error) {
			console.error(`Error getEnemy: ${error.message}`);
			throw error;
		}
	}

	public static getLevelUpSkills(classID: string, level: number, currentSkills: ISkill[]) {
		try {
			const { skills } = data as IGameData;
			const characterClass = this.getCharacterClassById(classID);
			const maxSkillLevel = EQUIPMENT_LEVELS.get(level);

			const filteredSkills = mapToArray(skills)
				.filter((skill) => currentSkills.findIndex((sk) => sk.id === skill.id) === -1)
				.filter((skill) => characterClass.skillClasses.includes(skill.class))
				.filter(({ level }) => maxSkillLevel >= level)
				.map(({ id }) => id);

			return getMultipleRandom(filteredSkills, 3);
		} catch (error) {
			console.error(`Error getLevelUpSkills: ${error.message}`);
			throw error;
		}
	}
}
