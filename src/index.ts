import "reflect-metadata"; // We need this in order to use @Decorators
import express, { Application } from "express";
import { config } from "./config";
import { loaders } from "./loaders";

const startServer = async () => {
    const app: Application = express();
    await loaders(app);
    console.debug(`MODE ENV ${process.env.NODE_ENV}`);
    app.listen(config.port, () => {
        console.info(`Server listening on port: ${config.port}`);
    }).on("error", (err) => {
        console.error(err);
        process.exit(1);
    });
};

startServer();
