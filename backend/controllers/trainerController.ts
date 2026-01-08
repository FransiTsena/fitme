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
