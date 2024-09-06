import { IArmourData, IGameData, IWeaponData, TEquipment } from "@common/types/gameData";
import data from "@common/data/gameData.json";
import { getMultipleRandom, getRandomElement, mapToArray, weightedChoice } from "@common/utils/helpers";
import { ISkill } from "@common/types/character";
import { ITEM_WEIGHT_LEVELS, SKILL_LEVELS } from "@common/utils/constants";
import { EquipmentSlot } from "@common/utils/enums";

export class GameData {
	public static getClasses() {
		try {
			const { classes } = data as IGameData;
			return mapToArray(classes).map((characterClass) => ({
				...characterClass,
				skills: this.populateSkillsFromID(characterClass.skills),
				equipment: this.populateEquipment(characterClass.equipment),
			}));
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
			const equipment = { ...armours, ...weapons };
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

	public static populateEquipment(equipment: Partial<TEquipment>) {
		const equipmentArray = Object.entries(equipment).map(([k, v]) =>
			v ? [k, { id: v, ...this.getEquipmentById(v) }] : [k, v],
		);
		return Object.fromEntries(equipmentArray) as Record<
			EquipmentSlot,
			(IWeaponData & { id: string }) | (IArmourData & { id: string })
		>;
	}

	public static getClassItems(classID: string) {
		try {
			const { armours, weapons } = data as IGameData;
			const characterClass = this.getCharacterClassById(classID);

			const filteredArmours = mapToArray(armours).filter(
				({ armourType }) => !armourType || characterClass.armourTypes.includes(armourType),
			);

			const filteredWeapons = mapToArray(weapons).filter(({ weaponType }) =>
				characterClass.weaponTypes.includes(weaponType),
			);

			return filteredArmours.concat(filteredWeapons);
		} catch (error) {
			console.error(`Error getClassItems: ${error.message}`);
			throw error;
		}
	}

	public static getWeightedItems(classID: string, amount: number, enemyLevel = 1) {
		const weightLevel = Math.min(enemyLevel, ITEM_WEIGHT_LEVELS.length - 1);
		const weights = ITEM_WEIGHT_LEVELS[weightLevel];

		const items = this.getClassItems(classID);

		const weightedItems = [] as string[];
		for (let i = 0; i < amount; i++) {
			const rarity = weightedChoice(weights);
			const pool = items.filter(({ id, level }) => level === +rarity && !weightedItems.includes(id));
			const randomItem = getRandomElement(pool);

			if (!randomItem) {
				throw new Error(`No item found for rarity ${rarity}`);
			}

			weightedItems.push(randomItem.id);
		}

		return weightedItems;
	}

	public static populateAvailableItems(items: string[]) {
		return items.map((id) => ({
			id,
			...this.getEquipmentById(id),
		}));
	}

	public static getEnemy(level: number, isBoss = false) {
		try {
			const { monsters } = data as IGameData;
			const enemyPool = mapToArray(monsters).filter(
				({ challenge, boss }) => boss === isBoss && challenge === level,
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
			const skillLevel = SKILL_LEVELS.get(level);

			const filteredSkills = mapToArray(skills)
				.filter((skill) => currentSkills.findIndex((sk) => sk.id === skill.id) === -1)
				.filter((skill) => characterClass.skillClasses.includes(skill.class))
				.filter(({ level }) => skillLevel === level)
				.map(({ id }) => id);

			return getMultipleRandom(filteredSkills, 3);
		} catch (error) {
			console.error(`Error getLevelUpSkills: ${error.message}`);
			throw error;
		}
	}
}
