import { type Request, type Response } from "express";
import { analyticsService } from "../services/analyticsService.js";

export const getGymAnalytics = async (req: Request, res: Response) => {
    try {
        const { gymId } = req.params;
        // Check ownership? For MVP/Dev, we allow getting it if you have the ID. 
        // In prod, check req.user.id matches gym.ownerId.

        if (!gymId) {
            return res.status(400).json({ error: "Gym ID is required" });
        }

        const data = await analyticsService.getOwnerDashboard(gymId);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error: any) {
        console.error("Analytics Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getTrainerAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || req.query.userId as string; // Fallback for dev

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const data = await analyticsService.getTrainerDashboard(userId);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error: any) {
        console.error("Trainer Analytics Error:", error);
        res.status(500).json({ error: error.message });
    }
};

