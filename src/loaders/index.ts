import { expressLoader } from "loaders/express";
import { Application } from "express";
import { mongooseLoader } from "loaders/mongoose";
import { dependencyInjector } from "./dependencyInjector";

export const loaders = async (app: Application): Promise<void> => {
	console.info("Loaders running");
	await mongooseLoader();
	await dependencyInjector();
	console.info("Dependency Injector loaded");
	console.info("Jobs loaded");

	await expressLoader(app);
};
