import { UserMembership } from "../models/userMembershipModel.js";
import { Payment } from "../models/paymentModel.js";
import { TrainingSession } from "../models/trainingSessionModel.js";
import { SessionBooking } from "../models/sessionBookingModel.js";
import { Trainer } from "../models/trainerModel.js";
import { Types } from "mongoose";

export const analyticsService = {

    /**
     * Get Aggregated Dashboard Data for Gym Owner
     */
    getOwnerDashboard: async (gymId: string) => {
        const gymObjectId = new Types.ObjectId(gymId);

        // 1. Gym Performance
        const activeMembers = await UserMembership.countDocuments({ gymId, status: "active" });
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const newMembersMonthly = await UserMembership.countDocuments({ 
            gymId, 
            createdAt: { $gte: thirtyDaysAgo } 
        });

        // 2. Revenue Analytics (Monthly)
        // Aggregate Payments linked to this gym's Memberships OR Sessions
        // Note: Payment model doesn't store gymId directly. We need to find payments linked to gym items.
        // Option A: Join UserMembership & SessionBooking to find paymentIds for this gym.
        
        // Find membership payment IDs
        const membershipPayments = await UserMembership.find({ gymId }, { paymentId: 1 });
        const memPaymentIds = membershipPayments.map(m => m.paymentId);

        // Find session payment IDs
        // SessionBooking -> gymId is stored? Yes.
        const sessionBookings = await SessionBooking.find({ gymId }, { paymentId: 1 });
        const sessionPaymentIds = sessionBookings.map(s => s.paymentId);

        const allPaymentIds = [...memPaymentIds, ...sessionPaymentIds];

        const totalRevenue = await Payment.aggregate([
            { $match: { _id: { $in: allPaymentIds }, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Revenue by Type
        const revenueByType = await Payment.aggregate([
            { $match: { _id: { $in: allPaymentIds }, status: "completed" } },
            { $group: { _id: "$type", total: { $sum: "$amount" } } }
        ]);

        // 3. Trainer Performance
        // Count trainers
        const activeTrainers = await Trainer.countDocuments({ gymId, status: "active" });
        
        // Sessions conducted per trainer (Top 5)
        const topTrainers = await SessionBooking.aggregate([
            { $match: { gymId: gymObjectId, status: "completed" } }, // Only completed sessions
            { $group: { _id: "$trainerId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: "trainers", localField: "_id", foreignField: "_id", as: "trainer" } },
            { $unwind: "$trainer" },
             // We need User name, trainer has userId. 
             // This can get complex with deep lookups. For MVP, returning trainer spec/rating is fine.
             // Or lookup user from trainer.userId
            { $lookup: { from: "user", localField: "trainer.userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $project: { name: "$user.name", count: 1, rating: "$trainer.rating.average" } }
        ]);

        // 4. Peak Usage (Popular Days)
        // Group booking dates by Day of Week
        const peakDays = await SessionBooking.aggregate([
            { $match: { gymId: gymObjectId } },
            { $project: { dayOfWeek: { $dayOfWeek: "$scheduledDate" } } }, // 1 (Sun) - 7 (Sat)
            { $group: { _id: "$dayOfWeek", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        return {
            gymPerformance: {
                activeMembers,
                newMembersMonthly
            },
            revenue: {
                total: totalRevenue[0]?.total || 0,
                byType: revenueByType
            },
            trainers: {
                activeCount: activeTrainers,
                topBooked: topTrainers
            },
            insights: {
                peakDays
            }
        };
    },

    /**
     * Get Aggregated Dashboard Data for Trainer
     */
    getTrainerDashboard: async (userId: string) => {
        // 1. Find Trainer Profile
        const trainer = await Trainer.findOne({ userId });
        if (!trainer) {
            throw new Error("Trainer profile not found");
        }
        const trainerId = trainer._id;

        // 2. Session Analytics
        const totalSessions = await SessionBooking.countDocuments({ trainerId, status: "completed" });
        const upcomingSessions = await SessionBooking.countDocuments({ 
            trainerId, 
            status: "booked",
            scheduledDate: { $gt: new Date() }
        });
        const cancelledSessions = await SessionBooking.countDocuments({ trainerId, status: "cancelled" });

        const totalBookedOrCompleted = await SessionBooking.countDocuments({ 
            trainerId, 
            status: { $in: ["completed", "cancelled"] } 
        });

        const completionRate = totalBookedOrCompleted > 0 
            ? Math.round((totalSessions / totalBookedOrCompleted) * 100) 
            : 0;

        // 3. Client Engagement
        // Unique clients
        const uniqueClients = await SessionBooking.distinct("memberId", { trainerId });
        
        // Repeat clients (Clients with > 1 completed session)
        const repeatClientStats = await SessionBooking.aggregate([
            { $match: { trainerId, status: "completed" } },
            { $group: { _id: "$memberId", count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } },
            { $count: "count" }
        ]);
        const repeatClients = repeatClientStats[0]?.count || 0;

        return {
            performance: {
                rating: trainer.rating.average,
                reviewCount: trainer.rating.count
            },
            sessions: {
                totalConducted: totalSessions,
                upcoming: upcomingSessions,
                cancelled: cancelledSessions,
                completionRate // Percentage
            },
            clients: {
                totalUnique: uniqueClients.length,
                repeatCount: repeatClients
            }
        };
    }
};

