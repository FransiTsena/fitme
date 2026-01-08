import express from "express";
import { searchCandidate, inviteMember, acceptInvitation } from "../controllers/trainerController.js";

const router = express.Router();

console.log("🛠️ Loading Trainer Routes File...");

// Search for candidates (members)
router.get("/search", searchCandidate);

// Invite a member to become a trainer
router.post("/invite", inviteMember);

// Accept invitation via token
router.post("/accept-invite", acceptInvitation);

export default router;
