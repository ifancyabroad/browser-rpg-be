import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";
import { middleware } from "./middleware";
import appRouter from "./routes";
import dotenv from "dotenv";

const envFound = dotenv.config();
if (envFound.error) {
	console.info("Couldn't find .env file");
}

const port = process.env.PORT || 8080;
const app: Application = express();

const sessionConfig = session({
	name: "sid",
	secret: process.env.JWT_SECRET,
	cookie: {
		httpOnly: true,
		secure: false,
		maxAge: 1000 * 60 * 60 * 7,
	},
	resave: false,
	saveUninitialized: true,
	store: MongoStore.create({
		mongoUrl: process.env.MONGODB_URI,
	}),
});

const connectToDatabase = async () => {
	const db = process.env.MONGODB_URI;
	try {
		const mongoConnection = await mongoose.connect(db);
		console.info("MongoDB has been connected");
		return mongoConnection.connection.db;
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
};

const startServer = async () => {
	await connectToDatabase();

	app.use(cors({ origin: true }));
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(helmet());
	app.use(sessionConfig);

	/*  Proxy rules */
	app.set("trust proxy", true);

	/*  Routes  */
	app.use("/api", appRouter);

	/*  404 middleware  */
	app.use(middleware.notFound);

	/*  Error middleware  */
	app.use(middleware.errorRequest);

	console.debug(`MODE ENV ${process.env.NODE_ENV}`);

	app.listen(port, () => {
		console.info(`Server listening on port: ${port}`);
	}).on("error", (err) => {
		console.error(err);
		process.exit(1);
	});
};

startServer();
