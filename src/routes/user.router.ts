// External Dependencies
import express, { Response } from "express";
import { middleware } from "../middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestUser } from "../types/user";
import { loginUser, registerUser } from "../controllers/user.controller";

// Global Config
export const userRouter = express.Router();

userRouter.use(express.json());

// GET
userRouter.get(
    "/",
    middleware.userAuth,
    expressAsyncHandler(async (req: RequestUser, res: Response) => {
        res.status(200).json({ user: req.user });
    }),
);

// POST
userRouter.post(
    "/login",
    // TODO: Add validation
    expressAsyncHandler(async (req: RequestUser, res: Response) => {
        const token = await loginUser(req.body);
        res.json({ token });
    }),
);

// PUT
userRouter.put(
    "/register",
    // TODO: Add validation
    expressAsyncHandler(async (req: RequestUser, res: Response) => {
        const token = await registerUser(req.body);
        res.json({ token });
    }),
);
