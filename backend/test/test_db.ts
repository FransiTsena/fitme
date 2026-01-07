import "dotenv/config";
import { MongoClient } from "mongodb";

console.log("Attempting to connect to MongoDB...");
console.log("URI:", process.env.MONGO_URI ? "Found" : "Missing");

if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing from .env");
    process.exit(1);
}

const client = new MongoClient(process.env.MONGO_URI);

try {
    await client.connect();
    console.log("Successfully connected to MongoDB");
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
} catch (error) {
    console.error("Connection failed:", error);
} finally {
    await client.close();
    process.exit(0);
}
