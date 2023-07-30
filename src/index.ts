import express from "express";
import { userRouter } from "./routes/user.router";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();
const app = express();
const port = 8080; // default port to listen

mongoose
    .connect(process.env.DB_CONN_STRING)
    .then(() => {
        app.use("/user", userRouter);

        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error);
        process.exit();
    });
