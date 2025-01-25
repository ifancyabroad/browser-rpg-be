import { SortOrder } from "mongoose";

export interface IStatsQuery {
	characterClass?: string;
}

export interface IHistoryQuery {
	page?: number;
	limit?: number;
	sort?: string;
	order?: SortOrder;
}
