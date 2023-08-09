import { GameDataService } from "game/services/gameDataService";

export type TClass = ReturnType<GameDataService["getCharacterClassByName"]>;
export type TSkill = ReturnType<GameDataService["getSkillById"]>;

export interface IGameDataService {
	getCharacterClassByName: (name: string) => TClass;
	getSkillById: (id: string) => TSkill;
}
