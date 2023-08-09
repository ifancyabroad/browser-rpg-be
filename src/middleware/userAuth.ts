import { Response, NextFunction, RequestHandler } from "express";
import { RequestUser } from "types/user";
import httpStatus from "http-status-codes";
import expressAsyncHandler from "express-async-handler";
import createError from "http-errors";

const userAuth: RequestHandler = expressAsyncHandler(async (req: RequestUser, res: Response, next: NextFunction) => {
	if (req.session.user) {
		next();
	} else {
		next(createError(httpStatus.BAD_REQUEST, "No session, authorization denied"));
	}
});

export { userAuth };
