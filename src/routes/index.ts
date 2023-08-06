import { Router } from "express";
import { userRouter } from "./api/user";
import characterRouter from "./api/character";
const appRouter = Router();

appRouter.use("/auth", userRouter);
appRouter.use("/character", characterRouter);

export { appRouter };
export default appRouter;
