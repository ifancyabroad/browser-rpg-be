import { Request } from "express";

export interface IUser {
	id: string;
	username: string;
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
	username: string;
	email: string;
	password: string;
}

export interface IGuestInput {
	id?: string;
	username: string;
}

export interface IRequestResetPasswordInput {
	email: string;
}

export interface IResetPasswordInput {
	userId: string;
	token: string;
	password: string;
}

export interface RequestUser extends Request {
	user?: IUserInput;
}

export interface RequestGuest extends Request {
	guest?: IGuestInput;
}

export interface RequestRequestResetPassword extends Request {
	requestResetPassword: IRequestResetPasswordInput;
}

export interface RequestResetPassword extends Request {
	requestResetPassword: IResetPasswordInput;
}
