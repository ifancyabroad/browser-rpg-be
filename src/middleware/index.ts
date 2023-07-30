import { checkObjectId } from "./checkObjectId";
import { userAuth } from "./userAuth";

export const middleware = {
    userAuth,
    checkObjectId,
};
