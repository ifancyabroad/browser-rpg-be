import { Request } from "express";
import { IsEmail, IsString, MinLength } from "class-validator";

export interface IUser {
	id: string;
	email: string;
	password: string;
}

export interface IUserInput {
	id?: string;
	email: string;
	password: string;
}

export interface RequestUser extends Request {
	user?: IUserInput;
}

export interface IUserService {
	loginUser: (userInput: IUserInput) => Promise<any>;
	registerUser: (userInput: IUserInput) => Promise<any>;
}
