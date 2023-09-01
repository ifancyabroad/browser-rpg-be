import { Request } from "express";

export interface IUser {
	id: string;
	email: string;
	password: string;
}

export interface IToken {
	user: string;
	token: string;
	createdAt: Date;
}

export interface IUserInput {
	id?: string;
	email: string;
	password: string;
}

export interface RequestUser extends Request {
	user?: IUserInput;
}

export interface RequestResetPassword extends Request {
	email: string;
}

export interface IUserService {
	loginUser: (userInput: IUserInput) => Promise<any>;
	registerUser: (userInput: IUserInput) => Promise<any>;
}
