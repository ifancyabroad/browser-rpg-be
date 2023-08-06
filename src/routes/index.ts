import { Router } from "express";
import { userRouter } from "./api/user";
import characterRouter from "./api/character";
import battleRouter from "./api/battle";
const appRouter = Router();

appRouter.use("/auth", userRouter);
appRouter.use("/character", characterRouter);
appRouter.use("/battle", battleRouter);

export { appRouter };
export default appRouter;
