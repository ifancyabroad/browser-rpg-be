import { IsEmail, IsString, MinLength } from "class-validator";

export class UserSignupDto {
	@IsEmail({}, { message: "Invalid email" })
	email: string;

	@IsString()
	@MinLength(3, { message: "Password must be at least 3 characters long" })
	password: string;
}

export class UserSigninDto {
	@IsEmail()
	email: string;

	@IsString()
	password: string;
}

export class UserRequestResetPasswordDto {
	@IsEmail()
	email: string;
}

export class UserResetPasswordDto {
	@IsString()
	@MinLength(3)
	password: string;
}
