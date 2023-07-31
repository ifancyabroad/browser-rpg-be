import { checkObjectId } from "./checkObjectId";
import { userAuth } from "./userAuth";
import { notFound } from "./notFound";
import { errorRequest } from "./errorRequest";

export const middleware = {
	userAuth,
	checkObjectId,
	notFound,
	errorRequest,
};
