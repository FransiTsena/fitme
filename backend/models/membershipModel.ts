import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMembershipPlan extends Document {
    gymId: Types.ObjectId;
    ownerId: Types.ObjectId;
    title: string;
    description?: string;
    durationInDays: number;
    price: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const membershipPlanSchema = new mongoose.Schema({
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    durationInDays: { type: Number, required: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
    collection: "membership_plans"
});

export const MembershipPlan = mongoose.model<IMembershipPlan>("MembershipPlan", membershipPlanSchema);
