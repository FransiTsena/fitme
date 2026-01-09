import { UserMembership } from "../models/userMembershipModel.js";
import { MembershipPlan } from "../models/membershipModel.js";
import { Payment } from "../models/paymentModel.js";
import { Gym } from "../models/gymModel.js";
import { Types } from "mongoose";

export const subscriptionService = {
    /**
     * Purchase a gym membership
     */
    purchaseMembership: async (userId: string, planId: string) => {
        // 1. Fetch Plan
        const plan = await MembershipPlan.findById(planId);
        if (!plan) throw new Error("Membership plan not found");
        if (!plan.isActive) throw new Error("Plan is no longer active");

        // 2. Enforce Rule: One Active Membership per Gym
        // Check if user already has an active membership for THIS gym
        const existingActive = await UserMembership.findOne({
            userId,
            gymId: plan.gymId,
            status: "active",
            endDate: { $gt: new Date() } // Not expired
        });

        if (existingActive) {
            throw new Error("You already have an active membership at this gym.");
        }

        // 3. Create Payment Record (Stub)
        const payment = new Payment({
            userId,
            amount: plan.price,
            currency: "ETB",
            status: "completed",
            method: "in-app",
            type: "membership"
        });
        await payment.save();


        // 4. Calculate Dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationInDays);

        // 5. Create Active Membership
        const membership = new UserMembership({
            userId,
            gymId: plan.gymId,
            planId: plan._id,
            paymentId: payment._id,
            startDate,
            endDate,
            status: "active"
        });

        await membership.save();

        return { membership, payment };
    },

    /**
     * Get User's Memberships
     */
    getUserMemberships: async (userId: string) => {
        return await UserMembership.find({ userId })
            .populate("gymId", "name address location")
            .populate("planId", "title price durationInDays description")
            .sort({ createdAt: -1 });
    }
};
