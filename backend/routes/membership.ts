import express from "express";
import { createMembershipPlan, getGymPlans, updateMembershipPlan, togglePlanStatus } from "../controllers/membershipController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { checkPlanOwnership } from "../middleware/checkPlanOwnership.js";

const router = express.Router();
console.log("🛠️ Loading Membership Routes File...");


// Create a membership plan
// NOTE: Ideally should be protected with requireAuth, but user requested OPEN endpoints for dev
router.post("/", createMembershipPlan);

// Update a membership plan (Protected by ownership check middleware)
router.put("/:id", checkPlanOwnership, updateMembershipPlan);

// Toggle plan status (Protected by ownership check middleware)
router.patch("/:id/status", checkPlanOwnership, togglePlanStatus);

// Get plans for a specific gym (Public)
router.get("/gym/:gymId", getGymPlans);

export default router;

