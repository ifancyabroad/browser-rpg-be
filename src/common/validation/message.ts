import { IsAscii, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class MessageDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	@MaxLength(1000)
	@IsAscii()
	message: string;
}
