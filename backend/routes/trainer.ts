import express from "express";
import { 
    searchCandidate, 
    inviteMember, 
    acceptInvitation,
    getTrainerProfile,
    updateTrainerProfile,
    getTrainerStats
} from "../controllers/trainerController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

console.log("🛠️ Loading Trainer Routes File...");

// Search for candidates (members)
router.get("/search", searchCandidate);

// Invite a member to become a trainer
router.post("/invite", inviteMember);

// Accept invitation via token
router.post("/accept-invite", acceptInvitation);

// Get trainer profile by user ID (requires auth)
router.get("/profile/:userId", requireAuth, getTrainerProfile);

// Update trainer profile (requires auth)
router.put("/profile", requireAuth, updateTrainerProfile);

// Get trainer statistics (requires auth)
router.get("/stats", requireAuth, getTrainerStats);

export default router;
