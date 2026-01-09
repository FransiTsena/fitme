import { TrainingSession, type ITrainingSession } from "../models/trainingSessionModel.js";
import { Trainer } from "../models/trainerModel.js";
import { Types } from "mongoose";

export const trainingSessionService = {
    /**
     * Create a new training session offering
     */
    createSession: async (data: { 
        trainerId: string;
        title: string;
        description?: string;
        durationMinutes: number;
        price: number;
    }) => {
        // 1. Verify Trainer & Get Gym ID
        const trainer = await Trainer.findOne({ userId: data.trainerId });
        if (!trainer) {
            throw new Error("Trainer profile not found");
        }
        
        if (!trainer.isActive) {
            throw new Error("Trainer account is not active");
        }

        // 2. Create Session
        const newSession = new TrainingSession({
            ...data,
            trainerId: trainer._id, // Link to Trainer ID (not User ID)
            gymId: trainer.gymId,   // Auto-link to Gym
            isActive: true
        });

        await newSession.save();
        return newSession;
    },

    /**
     * Get sessions by trainer
     */
    getSessionsByTrainer: async (trainerId: string) => {
        return await TrainingSession.find({ trainerId, isActive: true });
    },

    /**
     * Get sessions by user ID (looks up trainer first)
     */
    getSessionsByUser: async (userId: string) => {
        const trainer = await Trainer.findOne({ userId });
        if (!trainer) {
            throw new Error("Trainer profile not found");
        }
        
        return await TrainingSession.find({ trainerId: trainer._id })
            .sort({ createdAt: -1 });
    },

    /**
     * Get sessions by gym (Public View)
     */
    getSessionsByGym: async (gymId: string) => {
        return await TrainingSession.find({ gymId, isActive: true }).populate("trainerId", "specialization rating"); 
        // Note: We might need to populate 'trainerId' which refers to Trainer model, 
        // which then refers to User model for name.
    },

    /**
     * Update a session
     */
    updateSession: async (sessionId: string, updates: Partial<ITrainingSession>) => {
        const allowedUpdates = ["title", "description", "durationMinutes", "price"];
        const updateData: any = {};
        
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updateData[key] = (updates as any)[key];
            }
        });

        const updatedSession = await TrainingSession.findByIdAndUpdate(
            sessionId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedSession) {
            throw new Error("Session not found");
        }
        return updatedSession;
    },

    /**
     * Toggle session active status
     */
    toggleSessionStatus: async (sessionId: string, isActive: boolean) => {
        const updatedSession = await TrainingSession.findByIdAndUpdate(
            sessionId,
            { $set: { isActive } },
            { new: true }
        );

        if (!updatedSession) {
            throw new Error("Session not found");
        }
        return updatedSession;
    }
};

