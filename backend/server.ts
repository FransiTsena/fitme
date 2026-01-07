import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";
import userRoutes from "./routes/user.js";
import gymRoutes from "./routes/gym.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Better Auth (JWT) app listening on port ${port}`);
});
