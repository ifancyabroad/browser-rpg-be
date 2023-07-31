import { expressLoader } from "src/loaders/express";
import { Application } from "express";
import { mongooseLoader } from "src/loaders/mongoose";
import { UserModel } from "src/models/users";
import { IModelDI } from "src/types/dependencyInjectors";
import { dependencyInjector } from "./dependencyInjector";

export const loaders = async (app: Application): Promise<void> => {
    console.info("Loaders running");
    await mongooseLoader();
    const userModel: IModelDI = {
        name: "userModel",
        model: UserModel,
    };

    await dependencyInjector({
        models: [userModel],
    });
    console.info("Dependency Injector loaded");
    console.info("Jobs loaded");

    await expressLoader(app);
};
