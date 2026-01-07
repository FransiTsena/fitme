import "dotenv/config";
import { client } from "../models/authDb.js";
console.log("Imported client");
await client.connect();
console.log("Connected officially");
process.exit(0);
