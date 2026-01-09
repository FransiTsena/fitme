import { Types } from "mongoose";
import crypto from "crypto";
import { User } from "../models/userModel.js";
import { Trainer, TrainerPromotion } from "../models/trainerModel.js";
import { Gym } from "../models/gymModel.js";
import { SessionBooking } from "../models/sessionBookingModel.js";
import { TrainingSession } from "../models/trainingSessionModel.js";
import { sendEmail } from "../utils/email.js"; // Re-using existing email util

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export const trainerService = {
    /**
     * Search for potential candidates (members) by email or phone
     */
    searchCandidate: async (query: string) => {
        if (!query || query.length < 3) return [];

        // Find users who are just 'member' and match email or phone
        // Regex for partial match
        const regex = new RegExp(query, "i");
        
        const candidates = await User.find({
            role: "member",
            $or: [
                { email: regex },
                { phone: regex },
                { name: regex } // Also allowing name search
            ]
        }).select("name email phone city profileImage"); // Select only public/safe info

        return candidates;
    },

    /**
     * Invite a member to become a trainer
     */
    inviteMember: async (ownerId: string, gymId: string, memberId: string) => {
        // 1. Verify Gym & Ownership
        const gym = await Gym.findOne({ _id: gymId, ownerId });
        if (!gym) throw new Error("Gym not found or unauthorized");

        // 2. Verify Member exists and is eligible
        const member = await User.findById(memberId);
        if (!member) throw new Error("Member not found");
        if (member.role !== "member") throw new Error("User is not a member (already trainer/owner?)");

        // 3. Check for existing pending invitation
        const existingProto = await TrainerPromotion.findOne({
            gymId,
            memberId,
            status: "pending",
            expiresAt: { $gt: new Date() }
        });
        if (existingProto) throw new Error("Invitation already pending");

        // 4. Create Promotion Record with Token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 Days expiry

        const promotion = new TrainerPromotion({
            gymId,
            ownerId,
            memberId,
            status: "pending",
            token,
            expiresAt
        });

        await promotion.save();

        // 5. Send Email
        const inviteLink = `${FRONTEND_URL}/join-trainer?token=${token}`;
        await sendEmail({
            to: member.email,
            subject: `Invitation to join ${gym.name} as a Trainer`,
            html: `
                <h3>Hello ${member.name},</h3>
                <p>You have been invited by <strong>${gym.name}</strong> to join their team as a Trainer.</p>
                <p>Click the link below to accept the invitation:</p>
                <a href="${inviteLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
                <p><small>This link expires in 7 days.</small></p>
            `
        });

        return { message: "Invitation sent successfully", prmotionId: promotion._id };
    },

    /**
     * Accept Invitation via Token
     */
    acceptInvitation: async (token: string) => {
        // 1. Validate Token
        const promotion = await TrainerPromotion.findOne({
            token,
            status: "pending",
            expiresAt: { $gt: new Date() }
        });

        if (!promotion) throw new Error("Invalid or expired invitation token");

        // 2. Promote User
        const user = await User.findById(promotion.memberId);
        if (!user) throw new Error("User no longer exists");

        // Update User Role
        user.role = "trainer";
        await user.save();

        // 3. Create Trainer Profile
        const trainerProfile = new Trainer({
            userId: user._id,
            gymId: promotion.gymId,
            specialization: [],
            isActive: true
        });
        await trainerProfile.save();

        // 4. Update Promotion Status
        promotion.status = "accepted";
        await promotion.save();

        return { 
            message: "Invitation accepted! You are now a trainer.", 
            gymId: promotion.gymId 
        };
    },

    /**
     * Get Trainer Profile by User ID
     */
    getTrainerProfile: async (userId: string) => {
        const trainer = await Trainer.findOne({ userId })
            .populate("gymId", "name address photos rating");
        
        if (!trainer) {
            throw new Error("Trainer profile not found");
        }

        return trainer;
    },

    /**
     * Update Trainer Profile
     */
    updateTrainerProfile: async (userId: string, updates: {
        specialization?: string[];
        bio?: string;
    }) => {
        const allowedUpdates = ["specialization", "bio"];
        const updateData: any = {};
        
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updateData[key] = (updates as any)[key];
            }
        });

        const trainer = await Trainer.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate("gymId", "name address photos rating");

        if (!trainer) {
            throw new Error("Trainer profile not found");
        }

        return trainer;
    },

    /**
     * Get Trainer Statistics
     */
    getTrainerStats: async (userId: string) => {
        // Get trainer profile
        const trainer = await Trainer.findOne({ userId });
        if (!trainer) {
            throw new Error("Trainer profile not found");
        }

        // Get sessions count
        const sessions = await TrainingSession.find({ trainerId: trainer._id });
        const totalSessions = sessions.length;

        // Get bookings statistics
        const bookings = await SessionBooking.find({ trainerId: trainer._id });
        
        // Unique clients
        const uniqueClients = new Set(bookings.map(b => b.memberId.toString()));
        const totalClients = uniqueClients.size;

        // Booking stats
        const upcomingBookings = bookings.filter(b => 
            b.status === "booked" && new Date(b.scheduledDate) >= new Date()
        ).length;
        
        const completedBookings = bookings.filter(b => b.status === "completed").length;

        // Calculate earnings (sum of session prices for completed bookings)
        let totalEarnings = 0;
        for (const booking of bookings.filter(b => b.status === "completed")) {
            const session = sessions.find(s => s._id.toString() === booking.sessionId.toString());
            if (session) {
                totalEarnings += session.price;
            }
        }

        return {
            totalSessions,
            totalClients,
            upcomingBookings,
            completedBookings,
            totalEarnings,
            rating: trainer.rating?.average || 0
        };
    }
};
