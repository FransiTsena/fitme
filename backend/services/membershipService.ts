import { Types } from "mongoose";
import { MembershipPlan } from "../models/membershipModel.js";
import { Gym } from "../models/gymModel.js";

interface CreatePlanData {
    ownerId: string;
    gymId: string;
    title: string;
    description?: string;
    durationInDays: number;
    price: number;
}

export const membershipService = {
    /**
     * Create a new membership plan for a gym
     */
    createPlan: async (data: CreatePlanData) => {
        const { ownerId, gymId, ...planData } = data;

        // Validations
        if (!Types.ObjectId.isValid(gymId) || !Types.ObjectId.isValid(ownerId)) {
            throw new Error("Invalid Gym ID or Owner ID");
        }

        // Verify that the gym belongs to the owner
        const gym = await Gym.findOne({ _id: gymId, ownerId: ownerId });
        if (!gym) {
            throw new Error("Gym not found or you do not own this gym");
        }

        const newPlan = new MembershipPlan({
            ...planData,
            gymId: new Types.ObjectId(gymId),
            ownerId: new Types.ObjectId(ownerId),
            isActive: true
        });

        await newPlan.save();
        return newPlan;
    },

    /**
     * Get all plans for a specific gym (Public/Member view)
     */
    getPlansByGymId: async (gymId: string) => {
        return await MembershipPlan.find({ gymId, isActive: true });
    },

    /**
     * Update a membership plan
     */
    updatePlan: async (planId: string, updates: Partial<CreatePlanData>) => {
        const allowedUpdates = ["title", "description", "durationInDays", "price"];
        const updateData: any = {};
        
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updateData[key] = (updates as any)[key];
            }
        });

        // We assume ownership is checked by middleware/controller before calling this
        const updatedPlan = await MembershipPlan.findByIdAndUpdate(
            planId, 
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedPlan) {
            throw new Error("Plan not found");
        }
        return updatedPlan;
    },

    /**
     * Toggle plan active status
     */
    togglePlanStatus: async (planId: string, isActive: boolean) => {
        const updatedPlan = await MembershipPlan.findByIdAndUpdate(
            planId,
            { $set: { isActive } },
            { new: true }
        );
        
        if (!updatedPlan) {
            throw new Error("Plan not found");
        }
        return updatedPlan;
    }
};

