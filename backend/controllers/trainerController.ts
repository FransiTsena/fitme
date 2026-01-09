import { type Request, type Response } from "express";
import { trainerService } from "../services/trainerService.js";

export const searchCandidate = async (req: Request, res: Response) => {
    try {
        const { q } = req.query; // ?q=term
        const candidates = await trainerService.searchCandidate(q as string);
        res.status(200).json({ candidates });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const loadInvitation = async (req: Request, res: Response) => {
    // This could just return the promotion details for the frontend to show "You are invited by Gym X"
    // For now, acceptance is the main action. 
    // We can add a GET /invitation/:token later if needed.
    res.status(501).json({ message: "Not implemented yet, use accept directly for now" });
};

export const inviteMember = async (req: Request, res: Response) => {
    try {
        const { memberId, gymId } = req.body;
        // Dev: accept ownerId from body, otherwise from req.user
        const ownerId = req.user?.id || req.body.ownerId;

        if (!ownerId) return res.status(401).json({ error: "Unauthorized: Owner ID required" });

        const result = await trainerService.inviteMember(ownerId, gymId, memberId);
        res.status(201).json(result);
    } catch (error: any) {
        console.error("Invite Error:", error);
        res.status(400).json({ error: error.message });
    }
};

export const acceptInvitation = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: "Token is required" });

        const result = await trainerService.acceptInvitation(token);
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Accept Error:", error);
        res.status(400).json({ error: error.message });
    }
};

export const getTrainerProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const profile = await trainerService.getTrainerProfile(userId);
        res.status(200).json({ profile });
    } catch (error: any) {
        console.error("Get Trainer Profile Error:", error);
        res.status(400).json({ error: error.message });
    }
};

export const updateTrainerProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || req.body.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const updates = req.body;
        const profile = await trainerService.updateTrainerProfile(userId, updates);
        res.status(200).json({ message: "Profile updated", profile });
    } catch (error: any) {
        console.error("Update Trainer Profile Error:", error);
        res.status(400).json({ error: error.message });
    }
};

export const getTrainerStats = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || req.query.userId as string;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const stats = await trainerService.getTrainerStats(userId);
        res.status(200).json({ stats });
    } catch (error: any) {
        console.error("Get Trainer Stats Error:", error);
        res.status(400).json({ error: error.message });
    }
};
