import { Router } from "express";
import { userRouter } from "./user.router";
import characterRouter from "./character.router";
import battleRouter from "./battle.router";
const appRouter = Router();

appRouter.use("/auth", userRouter);
appRouter.use("/character", characterRouter);
appRouter.use("/battle", battleRouter);

export { appRouter };
export default appRouter;
