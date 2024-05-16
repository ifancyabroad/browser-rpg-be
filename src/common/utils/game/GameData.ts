import { IArmourData, IGameData, IWeaponData, TEquipment } from "@common/types/gameData";
import data from "@common/data/gameData.json";
import mapData from "@common/data/mapData.json";
import { getMultipleRandom, getRandomElement, mapToArray } from "@common/utils/helpers";
import { ISkill } from "@common/types/character";
import { EQUIPMENT_LEVELS, SHOP_ARMOURS, SHOP_WEAPONS, SKILL_LEVELS } from "@common/utils/constants";
import { EquipmentSlot, RoomState, RoomType } from "@common/utils/enums";
import { ILocation, IRoom } from "@common/types/map";

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

	public static getClassItems(classID: string, level: number, amount: number) {
		try {
			const { armours, weapons } = data as IGameData;
			const characterClass = this.getCharacterClassById(classID);
			const maxItemLevel = EQUIPMENT_LEVELS.get(level);

			const filteredArmours = mapToArray(armours)
				.filter(({ armourType }) => !armourType || characterClass.armourTypes.includes(armourType))
				.filter(({ level }) => maxItemLevel >= level)
				.map(({ id }) => id);

			const filteredWeapons = mapToArray(weapons)
				.filter(({ weaponType }) => characterClass.weaponTypes.includes(weaponType))
				.filter(({ level }) => maxItemLevel >= level)
				.map(({ id }) => id);

			const items = filteredArmours.concat(filteredWeapons);
			return getMultipleRandom(items, amount);
		} catch (error) {
			console.error(`Error getClassItems: ${error.message}`);
			throw error;
		}
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

	private static mapRoom(type: RoomType, location: ILocation) {
		const blockingRooms = [RoomType.Battle, RoomType.Boss, RoomType.None, RoomType.Wall];
		const state = blockingRooms.includes(type) ? RoomState.Blocking : RoomState.Idle;
		return { location, type, state };
	}

	private static mapLevel(rows: RoomType[][], level: number) {
		return rows.map((row, y) => row.map((room, x) => this.mapRoom(room, { level, y, x })));
	}

	public static getMaps() {
		return mapData.map((maps, level) => this.mapLevel(getRandomElement(maps), level));
	}

	public static getStartingLocation(maps: IRoom[][][], level = 0) {
		let x: number, y: number;
		y = maps[level].findIndex((row) => {
			x = row.findIndex(({ type }) => type === RoomType.Entrance);
			return x > -1;
		});
		return { level, x, y };
	}
}
