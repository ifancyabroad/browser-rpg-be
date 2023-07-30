import { Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { RequestUser } from "../types/user";
import httpStatus from "http-status-codes";
import expressAsyncHandler from "express-async-handler";
import createError from "http-errors";

const userAuth: RequestHandler = expressAsyncHandler(async (req: RequestUser, res: Response, next: NextFunction) => {
    const token = req.header("x-auth-token");
    if (!token) {
        next(createError(httpStatus.BAD_REQUEST, "No token, authorization denied"));
    }

    const jwtSecret = process.env.JWT_SECRET;
    jwt.verify(token, jwtSecret, function (err, decoded) {
        if (err) {
            next(createError(httpStatus.BAD_REQUEST, "Token not valid"));
            return;
        }
        req.user = (decoded as RequestUser).user;
        next();
    });
});

export { userAuth };
