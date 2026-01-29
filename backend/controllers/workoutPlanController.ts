import type { Request, Response } from "express";
import { workoutPlanService } from "../services/workoutPlanService.js";

export const workoutPlanController = {
    createPlan: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const plan = await workoutPlanService.createPlan({ ...req.body, ownerId: userId });
            res.status(201).json({ success: true, data: plan });
        } catch (err: any) {
            res.status(400).json({ success: false, error: err.message });
        }
    },

    getUserPlans: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const plans = await workoutPlanService.getUserPlans(userId);
            res.json({ success: true, data: plans });
        } catch (err: any) {
            res.status(400).json({ success: false, error: err.message });
        }
    },

    getTemplates: async (req: Request, res: Response) => {
        try {
            const { gymId } = req.query;
            const templates = await workoutPlanService.getTemplates(gymId as string);
            res.json({ success: true, data: templates });
        } catch (err: any) {
            res.status(400).json({ success: false, error: err.message });
        }
    },

    cloneTemplate: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { templateId } = req.params;
            const plan = await workoutPlanService.clonePlan(templateId, userId);
            res.json({ success: true, data: plan });
        } catch (err: any) {
            res.status(400).json({ success: false, error: err.message });
        }
    },

    autoGenerate: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { goal, level, daysPerWeek } = req.body;
            const plan = await workoutPlanService.generateWorkout(userId, { goal, level, daysPerWeek });
            res.json({ success: true, data: plan });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    updatePlan: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;
            const plan = await workoutPlanService.updatePlan(id, userId, req.body);
            res.json({ success: true, data: plan });
        } catch (err: any) {
            res.status(400).json({ success: false, error: err.message });
        }
    },

    deletePlan: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;
            await workoutPlanService.deletePlan(id, userId);
            res.json({ success: true, message: "Plan deleted" });
        } catch (err: any) {
            res.status(400).json({ success: false, error: err.message });
        }
    }
};
