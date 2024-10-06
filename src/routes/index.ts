import { Router } from "express";
import { userRouter } from "./user.router";
import characterRouter from "./character.router";
import battleRouter from "./battle.router";
import leaderboardRouter from "./leaderboard.router";
import contactRouter from "./contact.router";
const appRouter = Router();

appRouter.use("/auth", userRouter);
appRouter.use("/character", characterRouter);
appRouter.use("/battle", battleRouter);
appRouter.use("/leaderboard", leaderboardRouter);
appRouter.use("/contact", contactRouter);

export { appRouter };
export default appRouter;
