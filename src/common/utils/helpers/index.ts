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

export const weightedChoice = <T extends string | number | symbol>(source: Record<T, number>): T => {
	let rnd = Math.random();
	let lower = 0.0;
	for (let choice in source) {
		let weight = source[choice];
		let upper = lower + weight;
		if (rnd >= lower && rnd < upper) {
			return choice;
		}
		lower = upper;
	}

	// Never reached 100% and random
	// number is out of bounds
	return undefined;
};

export const getDeterminer = (name: string) => (name.match(/^[aeiou]/i) ? "an" : "a");
