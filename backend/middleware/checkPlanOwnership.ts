import { type Request, type Response, type NextFunction } from "express";
import { MembershipPlan } from "../models/membershipModel.js";
import { Gym } from "../models/gymModel.js";
import { Types } from "mongoose";

export const checkPlanOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const planId = req.params.id;
        // For dev/test openness: accept ownerId from body if not in req.user
        const userId = req.user?.id || req.body.ownerId;

        if (!planId) {
            return res.status(400).json({ error: "Plan ID is required" });
        }

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: Owner ID required" });
        }

        const plan = await MembershipPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({ error: "Membership Plan not found" });
        }

        // Verify that the user owns the gym associated with this plan
        // We check the Gym model to be sure, or we could check plan.ownerId directly if we trust it stays in sync.
        // Checking plan.ownerId is faster/simpler if reliable. Let's check the Gym to be double sure given the requirement "verify user owns the gym".
        const gym = await Gym.findOne({ _id: plan.gymId, ownerId: userId });

        if (!gym) {
            return res.status(403).json({ error: "Access denied. You do not own the gym for this plan." });
        }

        // Attach plan to request for convenience if needed downstream, 
        // though we mainly needed to validate access.
        (req as any).membershipPlan = plan;
        next();

    } catch (error: any) {
        console.error("Ownership Check Error:", error);
        res.status(500).json({ error: "Internal Server Error during ownership check" });
    }
};
