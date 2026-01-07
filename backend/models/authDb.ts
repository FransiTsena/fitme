import { MongoClient } from "mongodb";
const uri = process.env.MONGO_URI;
if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
}

export const client = new MongoClient(uri);

try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("MongoDB connected successfully");
} catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
}

export const db = client.db(); 



// Field Name	Type	Key	Description
// id	string	PK	Unique identifier for each user
// name	string	-	User's chosen display name
// email	string	-	User's email address for communication and login
// emailVerified	boolean	-	Whether the user's email is verified
// image	string	?	User's image url
// createdAt	Date	-	Timestamp of when the user account was created
// updatedAt	Date	-	Timestamp of the last update to the user's informat


