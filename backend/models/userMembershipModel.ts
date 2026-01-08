import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUserMembership extends Document {
    userId: Types.ObjectId;
    gymId: Types.ObjectId;
    planId: Types.ObjectId;
    paymentId: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    status: "active" | "expired" | "cancelled";
    createdAt: Date;
    updatedAt: Date;
}

const userMembershipSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    planId: { type: Schema.Types.ObjectId, ref: "MembershipPlan", required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", required: true },
    
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    
    status: { 
        type: String, 
        enum: ["active", "expired", "cancelled"], 
        default: "active" 
    }
}, {
    timestamps: true,
    collection: "memberships" // Distinct from 'membership_plans'
});

// Compound index to quickly find active memberships for a user at a gym
userMembershipSchema.index({ userId: 1, gymId: 1, status: 1 });

export const UserMembership = mongoose.model<IUserMembership>("UserMembership", userMembershipSchema);
