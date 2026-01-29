import type { Request, Response } from "express";
import { Exercise } from "../models/exerciseModel.js";

export const exerciseController = {
    getExercises: async (req: Request, res: Response) => {
        try {
            const { category, bodyPart } = req.query;
            const query: any = {};
            if (category) query.category = category;
            if (bodyPart) query.bodyPart = bodyPart;

            const exercises = await Exercise.find(query).sort({ name: 1 });
            res.json({ success: true, data: exercises });
        } catch (err: any) {
            res.status(400).json({ success: false, error: err.message });
        }
    },

    getExerciseById: async (req: Request, res: Response) => {
        try {
            const exercise = await Exercise.findById(req.params.id);
            if (!exercise) return res.status(404).json({ success: false, error: "Exercise not found" });
            res.json({ success: true, data: exercise });
        } catch (err: any) {
            res.status(400).json({ success: false, error: err.message });
        }
    }
};
