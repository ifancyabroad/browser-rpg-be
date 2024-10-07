import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ContactDto {
	@IsEmail()
	email: string;

	@IsString()
	@IsNotEmpty()
	subject: string;

	@IsString()
	@IsNotEmpty()
	body: string;
}
