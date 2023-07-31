import express, { Application } from "express";
import cors from "cors";
import { appRouter } from "src/routes";
import { config } from "src/config";
import helmet from "helmet";
import { middleware } from "src/middleware";

export const expressLoader = async (app: Application) => {
	/* Middleware*/
	app.use(cors({ origin: true }));
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(helmet());

	/*  Proxy rules */
	app.set("trust proxy", true);

	/*  Routes  */
	app.use(config.api.prefix, appRouter);

	/*  404 middleware  */
	app.use(middleware.notFound);

	/*  Error middleware  */
	app.use(middleware.errorRequest);
};
