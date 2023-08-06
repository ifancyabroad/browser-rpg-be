export interface IGameService {
	d4: number;
	d6: number;
	d8: number;
	d10: number;
	d12: number;
	d20: number;

	getModifier: (value: number) => number;
	getHitPoints: (constitution: number) => number;
}
