import { Response, NextFunction, RequestHandler, Request } from "express";
import httpStatus from "http-status-codes";
import expressAsyncHandler from "express-async-handler";
import createError from "http-errors";

const userAuth: RequestHandler = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	if (req.session.user) {
		next();
	} else {
		next(createError(httpStatus.BAD_REQUEST, "No session, authorization denied"));
	}
});

export { userAuth };
