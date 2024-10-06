import { Request } from "express";

export interface IContactInput {
	email: string;
	subject: string;
	body: string;
}

export interface RequestContact extends Request {
	form: IContactInput;
}
