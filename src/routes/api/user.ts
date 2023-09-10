import { Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestResetPassword, RequestUser } from "types/user";
import { Container } from "typedi";
import { UserService } from "@services/userService";
import { UserResetPasswordDto, UserSigninDto, UserSignupDto } from "@validation/user";

const userRouter = Router();

// @GET '/auth'
// @DEST Get user
userRouter.get(
	"/",
	middleware.userAuth,
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		res.status(200).json({ user: req.user });
	}),
);

// @GET '/auth/session'
// @DEST Get user session
userRouter.get(
	"/session",
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const session = Boolean(req.session.user);
		res.status(200).json({ session });
	}),
);

// @POST '/auth/login'
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

// @POST '/auth/logout'
// @DES Logout user
userRouter.delete(
	"/logout",
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		req.session.destroy((err) => {
			if (err) {
				console.error(`Error logout: ${err.message}`);
				throw err;
			} else {
				res.json({});
			}
		});
	}),
);

// @PUT '/auth/register'
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

// @POST '/auth/requestResetPassword'
// @DES Request reset password
userRouter.post(
	"/requestResetPassword",
	middleware.validation(UserResetPasswordDto),
	expressAsyncHandler(async (req: RequestResetPassword, res: Response) => {
		const userService = Container.get(UserService);
		const user = await userService.registerUser(req.body);
		req.session.user = user;
		req.session.save();
		res.json({ user });
	}),
);

// @POST '/auth/resetPassword'
// @DES Reset password
userRouter.post(
	"/resetPassword",
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
