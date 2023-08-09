import { Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestUser } from "types/user";
import { Container } from "typedi";
import { UserService } from "@services/userService";
import { UserSigninDto, UserSignupDto } from "@validation/user";

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

// @GET '/auth'
// @DEST Get user session
userRouter.get(
	"/session",
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const session = Boolean(req.session.user);
		res.status(200).json({ session });
	}),
);

// @POST '/auth'
// @DES Login user
userRouter.post(
	"/login",
	middleware.validation(UserSigninDto),
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const userService = Container.get(UserService);
		const user = await userService.loginUser(req.body);
		req.session.user = user;
		req.session.save();
		res.json({ user });
	}),
);

// @PUT '/auth/users'
// @DES Register user
userRouter.put(
	"/register",
	middleware.validation(UserSignupDto),
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const userService = Container.get(UserService);
		const user = await userService.registerUser(req.body);
		req.session.user = user;
		req.session.save();
		res.json({ user });
	}),
);

export { userRouter };
export default userRouter;
