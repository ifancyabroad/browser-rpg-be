import express, { Application } from "express";
import cors from "cors";
import { appRouter } from "routes";
import { config } from "config";
import helmet from "helmet";
import { middleware } from "middleware";
import session from "express-session";
import MongoStore from "connect-mongo";

export const expressLoader = async (app: Application) => {
	/* Middleware*/
	app.use(cors({ origin: true }));
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(helmet());
	app.use(
		session({
			name: "sid",
			secret: config.jwtSecret,
			cookie: {
				httpOnly: true,
				secure: false,
				maxAge: 1000 * 60 * 60 * 7,
			},
			resave: false,
			saveUninitialized: true,
			store: MongoStore.create({
				mongoUrl: config.dbUrl,
			}),
		}),
	);

	/*  Proxy rules */
	app.set("trust proxy", true);

	/*  Routes  */
	app.use(config.api.prefix, appRouter);

	/*  404 middleware  */
	app.use(middleware.notFound);

	/*  Error middleware  */
	app.use(middleware.errorRequest);
};
