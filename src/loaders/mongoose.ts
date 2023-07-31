import mongoose from "mongoose";
import { config } from "src/config";
export const mongooseLoader = async () => {
    const db = config.dbUrl;
    try {
        const mongoConnection = await mongoose.connect(db);
        console.info("MongoDB has been connected");
        return mongoConnection.connection.db;
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
