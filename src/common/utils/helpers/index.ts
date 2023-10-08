export const mapToArray = <T extends object>(object: T) => {
	return Object.keys(object).map((id) => ({
		...object[id as keyof typeof object],
		id,
	}));
};

export const getMultipleRandom = <T>(arr: T[], num: number) => {
	const shuffled = [...arr].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, num);
};

export const getRandomElement = <T>(arr: T[]) => {
	return arr[Math.floor(Math.random() * arr.length)];
};
