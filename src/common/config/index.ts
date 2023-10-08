import dotenv from "dotenv";

process.env.NODE_ENV = process.env.NODE_ENV || "development";
const envFound = dotenv.config();
if (envFound.error) {
	console.info("Couldn't find .env file");
}

export const config = {
	port: process.env.PORT || 8080,
	dbUrl: process.env.MONGODB_URI,
	jwtSecret: process.env.JWT_SECRET,
	api: {
		prefix: "/api",
	},
	emails: {
		region: process.env.AWS_REGION,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	},
};

export enum MODES {
	LOCAL = "local",
	DEV = "development",
	PROD = "production",
}
