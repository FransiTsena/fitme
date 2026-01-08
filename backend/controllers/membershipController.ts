import { type Request, type Response } from "express";
import { membershipService } from "../services/membershipService.js";

export const createMembershipPlan = async (req: Request, res: Response) => {
    try {
        const { gymId, title, description, durationInDays, price } = req.body;
        
        // For testing, we might accept ownerId from body if auth is disabled,
        // otherwise it should come from req.user
        const ownerId = req.user?.id || req.body.ownerId;

        if (!ownerId) {
            return res.status(401).json({ error: "Unauthorized: Owner ID required" });
        }

        if (!gymId || !title || !durationInDays || !price) {
            return res.status(400).json({ 
                error: "Missing required fields: gymId, title, durationInDays, price" 
            });
        }

        const newPlan = await membershipService.createPlan({
            ownerId,
            gymId,
            title,
            description,
            durationInDays: Number(durationInDays),
            price: Number(price)
        });

        res.status(201).json({
            message: "Membership Plan created successfully",
            plan: newPlan
        });
    } catch (error: any) {
        console.error("Create Membership Plan Error:", error);
        res.status(400).json({ error: error.message });
    }
};

export const getGymPlans = async (req: Request, res: Response) => {
    try {
        const { gymId } = req.params;
        if (!gymId) {
             return res.status(400).json({ error: "Gym ID is required" });
        }
        const plans = await membershipService.getPlansByGymId(gymId);
        res.status(200).json({ plans });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateMembershipPlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (!id) {
            return res.status(400).json({ error: "Plan ID is required" });
        }

        // ownership checked by middleware
        const updatedPlan = await membershipService.updatePlan(id, updates);


        res.status(200).json({
            message: "Membership Plan updated successfully",
            plan: updatedPlan
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const togglePlanStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (!id) {
             return res.status(400).json({ error: "Plan ID is required" });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({ error: "isActive must be a boolean" });
        }

        // ownership checked by middleware
        const updatedPlan = await membershipService.togglePlanStatus(id, isActive);


        res.status(200).json({
            message: `Membership Plan ${isActive ? "activated" : "deactivated"} successfully`,
            plan: updatedPlan
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


