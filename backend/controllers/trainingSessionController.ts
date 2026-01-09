import { type Request, type Response } from "express";
import { trainingSessionService } from "../services/trainingSessionService.js";

export const createSession = async (req: Request, res: Response) => {
    try {
        const { title, description, durationMinutes, price } = req.body;
        
        // Ensure user is authenticated and is a trainer
        // For Dev: allow passing userId in body if needed, but ideally comes from req.user
        const userId = req.user?.id || req.body.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!title || !durationMinutes || !price) {
            return res.status(400).json({ error: "Missing required fields: title, durationMinutes, price" });
        }

        const session = await trainingSessionService.createSession({
            trainerId: userId, // Service looks up Trainer profile by User ID
            title,
            description,
            durationMinutes: Number(durationMinutes),
            price: Number(price)
        });

        res.status(201).json({
            message: "Training Session created successfully",
            session
        });

    } catch (error: any) {
        console.error("Create Session Error:", error);
        res.status(400).json({ error: error.message });
    }
};

export const getMySessions = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || req.query.userId as string;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const sessions = await trainingSessionService.getSessionsByUser(userId);
        res.status(200).json({ sessions });

    } catch (error: any) {
        console.error("Get My Sessions Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getGymSessions = async (req: Request, res: Response) => {
    try {
        const { gymId } = req.params;
        if (!gymId) {
            return res.status(400).json({ error: "Gym ID is required" });
        }
        const sessions = await trainingSessionService.getSessionsByGym(gymId);
        res.status(200).json({ sessions });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateSession = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!id) {
            return res.status(400).json({ error: "Session ID is required" });
        }

        // Ideally we check ownership here (trainerId matches session.trainerId)
        // For MVP/Dev, we rely on the service to find/update by ID. 
        // TODO: Add ownership check middleware for sessions if needed strictly.

        const updatedSession = await trainingSessionService.updateSession(id, updates);

        res.status(200).json({
            message: "Training Session updated successfully",
            session: updatedSession
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const toggleSessionStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Session ID is required" });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({ error: "isActive must be a boolean" });
        }

        const updatedSession = await trainingSessionService.toggleSessionStatus(id, isActive);

        res.status(200).json({
            message: `Training Session ${isActive ? "activated" : "deactivated"} successfully`,
            session: updatedSession
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

