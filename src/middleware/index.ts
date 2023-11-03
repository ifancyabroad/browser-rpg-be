import { userAuth } from "./userAuth";
import { notFound } from "./notFound";
import { errorRequest } from "./errorRequest";
import { validation } from "./validation";

export const middleware = {
	userAuth,
	notFound,
	errorRequest,
	validation,
};
