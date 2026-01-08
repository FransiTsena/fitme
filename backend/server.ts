import "dotenv/config";
// Force restart
import express from "express";

import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";
import userRoutes from "./routes/user.js";
import gymRoutes from "./routes/gym.js";
import membershipRoutes from "./routes/membership.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🛡️ Database Connection (Mongoose)
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is not defined in environment variables");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB (Mongoose) connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });


const app = express();
const port = 3005;

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || ["http://localhost:3000", "http://localhost:19000", "http://localhost:19006", "exp://localhost:19000", "exp://127.0.0.1:19000"],
    credentials: true,
  })
);

// 🔥 IMPORTANT: Better Auth routes for JWT authentication
// MUST be before express.json()
app.all("/api/auth/{*any}", toNodeHandler(auth));

// JSON middleware
app.use(express.json());

// Serve uploaded files (documents) - protected by admin check in routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/gyms", gymRoutes);
console.log("🛠️ Registering /api/memberships route...");
app.use("/api/memberships", membershipRoutes);



// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("❌ SERVER ERROR:", err);
  res.status(500).json({
    error: err.message || "Internal Server Error",
    details: err.details || err.toString(),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Better Auth (JWT) app listening on port ${port}`);
});
