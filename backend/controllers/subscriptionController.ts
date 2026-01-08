import { type Request, type Response } from "express";
import { subscriptionService } from "../services/subscriptionService.js";

export const purchaseMembership = async (req: Request, res: Response) => {
    try {
        const { planId } = req.body;
        // Ideally from Auth middleware
        const userId = req.user?.id || req.body.userId; // Fallback for dev

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!planId) {
            return res.status(400).json({ error: "Plan ID is required" });
        }

        const result = await subscriptionService.purchaseMembership(userId, planId);

        res.status(201).json({
            message: "Membership purchased successfully",
            data: result
        });

    } catch (error: any) {
        console.error("Purchase Error:", error);
        res.status(400).json({ error: error.message });
    }
};

export const getMyMemberships = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || req.query.userId as string; // Fallback

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const memberships = await subscriptionService.getUserMemberships(userId);
        res.status(200).json({ memberships });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
