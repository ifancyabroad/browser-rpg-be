import { Request } from "express";

export interface IMessageInput {
	message: string;
}

export interface RequestMessage extends Request {
	message: IMessageInput;
}
