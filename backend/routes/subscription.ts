import express from "express";
import { purchaseMembership, getMyMemberships } from "../controllers/subscriptionController.js";

const router = express.Router();

console.log("🛠️ Loading Subscription Routes...");

// Buy a membership
router.post("/purchase", purchaseMembership);

// Get my memberships
router.get("/my", getMyMemberships);

export default router;
