import express from "express";
import { createSession, getGymSessions, getSessionById, updateSession, toggleSessionStatus, getMySessions } from "../controllers/trainingSessionController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

console.log("🛠️ Loading Training Session Routes...");

// Create a new session (Trainer only - requires auth)
router.post("/", requireAuth, createSession);

// Get trainer's own sessions (requires auth)
router.get("/my-sessions", requireAuth, getMySessions);

// Get all sessions for a gym (Public)
router.get("/gym/:gymId", getGymSessions);

// Get a single session by ID
router.get("/:id", getSessionById);

// Update session (requires auth)
router.put("/:id", requireAuth, updateSession);

// Toggle status (requires auth)
router.patch("/:id/status", requireAuth, toggleSessionStatus);


export default router;
