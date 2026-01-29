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
     * Get sessions by gym
     */
    getSessionsByGym: async (gymId: string, userId?: string) => {
        // If userId is provided, we can optionally check for membership
        // In many fitness apps, you must be a member to see/book sessions.
        // Let's implement the check as requested.

        if (userId) {
            const { UserMembership } = await import("../models/userMembershipModel.js");
            const { Trainer } = await import("../models/trainerModel.js");
            const { Gym } = await import("../models/gymModel.js");

            // 1. Check if user is the gym owner
            const gym = await Gym.findById(gymId);
            if (gym && gym.ownerId.toString() === userId) {
                return await TrainingSession.find({ gymId, isActive: true })
                    .populate({
                        path: "trainerId",
                        populate: { path: "userId", select: "name" }
                    });
            }

            // 2. Check if user is a trainer at this gym
            const trainer = await Trainer.findOne({ userId, gymId });
            if (trainer) {
                return await TrainingSession.find({ gymId, isActive: true })
                    .populate({
                        path: "trainerId",
                        populate: { path: "userId", select: "name" }
                    });
            }

            // 3. Check for active membership
            const membership = await UserMembership.findOne({
                userId,
                gymId,
                status: "active",
                endDate: { $gt: new Date() }
            });

            if (!membership) {
                // If not a member, owner or trainer, return empty list
                return [];
            }
        }

        return await TrainingSession.find({ gymId, isActive: true })
            .populate({
                path: "trainerId",
                populate: { path: "userId", select: "name" }
            });
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
    },

    /**
     * Get a session by ID
     */
    getSessionById: async (sessionId: string) => {
        const session = await TrainingSession.findById(sessionId).populate("trainerId", "specialization rating");
        if (!session) {
            throw new Error("Session not found");
        }
        return session;
    }
};