import mongoose, { Schema, Document, Types } from "mongoose";

// ----------------------
// TRAINER PROFILE SCHEME
// ----------------------
export interface ITrainer extends Document {
    userId: Types.ObjectId;
    gymId: Types.ObjectId;
    specialization: string[];
    bio?: string;
    rating: {
        average: number;
        count: number;
    };
    isActive: boolean;
    promotedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const trainerSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    specialization: [{ type: String }],
    bio: { type: String },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    isActive: { type: Boolean, default: true },
    promotedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    collection: "trainers"
});

export const Trainer = mongoose.model<ITrainer>("Trainer", trainerSchema);

// ----------------------
// PROMOTION REQUEST SCHEME
// ----------------------
export interface ITrainerPromotion extends Document {
    gymId: Types.ObjectId;
    ownerId: Types.ObjectId;
    memberId: Types.ObjectId;
    status: "pending" | "accepted" | "rejected";
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const trainerPromotionSchema = new Schema({
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    memberId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { 
        type: String, 
        enum: ["pending", "accepted", "rejected"], 
        default: "pending" 
    },
    token: { type: String, required: true }, // Secure random token
    expiresAt: { type: Date, required: true }
}, {
    timestamps: true,
    collection: "trainer_promotions"
});

// Index for fast token lookup
trainerPromotionSchema.index({ token: 1 });

export const TrainerPromotion = mongoose.model<ITrainerPromotion>("TrainerPromotion", trainerPromotionSchema);
