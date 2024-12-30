import { Request, Response, Router } from "express";
import { middleware } from "middleware";
import expressAsyncHandler from "express-async-handler";
import { RequestGuest, RequestRequestResetPassword, RequestResetPassword, RequestUser } from "@common/types/user";
import { loginUser, registerGuest, registerUser, requestResetPassword, resetPassword } from "@services/user.service";
import {
	GuestSignupDto,
	UserRequestResetPasswordDto,
	UserResetPasswordDto,
	UserSigninDto,
	UserSignupDto,
} from "@common/validation/user";

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
	expressAsyncHandler(async (req: Request, res: Response) => {
		res.status(200).json({ user: req.session.user ?? null });
	}),
);

// @POST '/auth/login'
// @DES Login user
userRouter.post(
	"/login",
	middleware.validation(UserSigninDto),
	expressAsyncHandler(async (req: RequestUser, res: Response) => {
		const user = await loginUser(req.body);
		req.session.user = user;
		req.session.save();
		res.json({ user });
	}),
);

// @POST '/auth/logout'
// @DES Logout user
userRouter.delete(
	"/logout",
	expressAsyncHandler(async (req: Request, res: Response) => {
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
		const user = await registerUser(req.body, req.session);
		req.session.user = user;
		req.session.save();
		res.json({ user });
	}),
);

// @PUT '/auth/registerGuest'
// @DES Register guest
userRouter.put(
	"/registerGuest",
	middleware.validation(GuestSignupDto),
	expressAsyncHandler(async (req: RequestGuest, res: Response) => {
		const user = await registerGuest(req.body);
		req.session.user = user;
		req.session.save();
		res.json({ user });
	}),
);

// @POST '/auth/requestResetPassword'
// @DES Request reset password
userRouter.post(
	"/requestResetPassword",
	middleware.validation(UserRequestResetPasswordDto),
	expressAsyncHandler(async (req: RequestRequestResetPassword, res: Response) => {
		const link = await requestResetPassword(req.body);
		res.json({ link });
	}),
);

// @POST '/auth/resetPassword'
// @DES Reset password
userRouter.post(
	"/resetPassword",
	middleware.validation(UserResetPasswordDto),
	expressAsyncHandler(async (req: RequestResetPassword, res: Response) => {
		const message = await resetPassword(req.body);
		res.json({ message });
	}),
);

export { userRouter };
export default userRouter;
