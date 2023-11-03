import { IsEmail, IsString, MinLength } from "class-validator";

export class UserSignupDto {
	@IsEmail()
	email: string;

	@IsString()
	@MinLength(3)
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
