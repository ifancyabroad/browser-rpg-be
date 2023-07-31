// External Dependencies
import { Response, Router } from "express";
import { middleware } from "src/middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestUser } from "src/types/user";
import { Container } from "typedi";
import { UserService } from "src/services/userService";

const userRouter = Router();

// @GET '/auth'
// @DEST Get user authenticated

userRouter.get(
	"/",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		res.status(200).json({ user: req.user });
	}),
);

// @POST '/auth'
// @DES Login user

userRouter.post(
	"/login",
	// TODO: Add validation
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const userService = Container.get(UserService);
		const token = await userService.loginUser(req.body);
		res.json({ token });
	}),
);

// @PUT '/auth/users'
// @DES Register user

userRouter.put(
	"/register",
	// TODO: Add validation
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const userService = Container.get(UserService);
		const token = await userService.registerUser(req.body);
		res.json({ token });
	}),
);

export { userRouter };
export default userRouter;
