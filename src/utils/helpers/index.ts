export const mapToArray = <T extends object>(object: T) => {
	return Object.keys(object).map((id) => ({
		...object[id as keyof typeof object],
		id,
	}));
};
