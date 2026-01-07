import "dotenv/config";
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

console.log("🔍 SMTP Diagnostics");
console.log("------------------");
console.log(`Host: ${host}`);
console.log(`Port: ${port}`);
console.log(`User: ${user}`);
console.log(`Pass: ${pass ? "********" : "MISSING"}`);
console.log("------------------");

if (!host || !port || !user || !pass) {
    console.error("❌ Missing required environment variables.");
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
});

console.log("📡 Testing connection...");

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP connection failed:");
        console.error(error);
        
        if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
            console.log("\n💡 TIP: Your SMTP_HOST is set to localhost. If you're using Gmail or another service, update it in .env.");
        }
    } else {
        console.log("✅ SMTP connection successful! Your server is ready to send emails.");
    }
    process.exit(0);
});
