// External Dependencies
import { Response, Router } from "express";
import { middleware } from "src/middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestUser, UserSigninDto, UserSignupDto } from "src/types/user";
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
	middleware.validation(UserSigninDto),
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
	middleware.validation(UserSignupDto),
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const userService = Container.get(UserService);
		const token = await userService.registerUser(req.body);
		res.json({ token });
	}),
);

export { userRouter };
export default userRouter;
