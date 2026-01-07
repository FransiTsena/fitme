import "dotenv/config";
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
if (process.env.MONGO_URI) {
    console.log("Protocol:", process.env.MONGO_URI.split(":")[0]);
}
process.exit(0);
