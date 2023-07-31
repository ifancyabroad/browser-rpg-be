import dotenv from "dotenv";

process.env.NODE_ENV = process.env.NODE_ENV || "development";
const envFound = dotenv.config();
if (envFound.error) {
	throw new Error("Couldn't find .env file");
}

export const config = {
	port: process.env.PORT || 8080,
	dbUrl: process.env.MONGODB_URI,
	jwtSecret: process.env.JWT_SECRET,
	api: {
		prefix: "/api",
	},
};

export enum MODES {
	LOCAL = "local",
	DEV = "development",
	PROD = "production",
}
