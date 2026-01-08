import express from "express";
import { createSession, getGymSessions, updateSession, toggleSessionStatus } from "../controllers/trainingSessionController.js";

const router = express.Router();

console.log("🛠️ Loading Training Session Routes...");

// Create a new session (Trainer only)
router.post("/", createSession);

// Update session
router.put("/:id", updateSession);

// Toggle status
router.patch("/:id/status", toggleSessionStatus);

// Get all sessions for a gym (Public)
router.get("/gym/:gymId", getGymSessions);


export default router;
