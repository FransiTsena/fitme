import express from "express";
import { purchaseMembership, getMyMemberships } from "../controllers/subscriptionController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

console.log("🛠️ Loading Subscription Routes...");

// Buy a membership (requires auth)
router.post("/purchase", requireAuth, purchaseMembership);

// Get my memberships (requires auth)
router.get("/my", requireAuth, getMyMemberships);

export default router;
