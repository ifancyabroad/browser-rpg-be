// External Dependencies
import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

// Global Variables
export const collections: { users?: mongoDB.Collection } = {};

// Initialize Connection
export async function connectToDatabase() {
    dotenv.config();

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING);

    await client.connect();

    const db: mongoDB.Db = client.db(process.env.DB_NAME);

    await applySchemaValidation(db);

    const usersCollection: mongoDB.Collection = db.collection(process.env.USERS_COLLECTION_NAME);

    collections.users = usersCollection;

    console.log(
        `Successfully connected to database: ${db.databaseName} and collection: ${usersCollection.collectionName}`,
    );
}

async function applySchemaValidation(db: mongoDB.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["email", "password"],
            additionalProperties: false,
            properties: {
                _id: {},
                email: {
                    bsonType: "string",
                    description: "'email' is required and is a string",
                },
                password: {
                    bsonType: "string",
                    description: "'password' is required and is a string",
                },
            },
        },
    };

    await db
        .command({
            collMod: process.env.USERS_COLLECTION_NAME,
            validator: jsonSchema,
        })
        .catch(async (error: mongoDB.MongoServerError) => {
            if (error.codeName === "NamespaceNotFound") {
                await db.createCollection(process.env.USERS_COLLECTION_NAME, { validator: jsonSchema });
            }
        });
}
