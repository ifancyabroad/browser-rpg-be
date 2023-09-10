import { GameDataService } from "@game/services/gameDataService";

export type TClass = ReturnType<GameDataService["getCharacterClassById"]>;
export type TSkill = ReturnType<GameDataService["getSkillById"]>;

export interface IGameDataService {
	getCharacterClassById: (id: string) => TClass;
	getSkillById: (id: string) => TSkill;
}
