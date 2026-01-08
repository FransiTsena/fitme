import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITrainingSession extends Document {
    trainerId: Types.ObjectId;
    gymId: Types.ObjectId;
    title: string;
    description?: string;
    durationMinutes: number;
    price: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const trainingSessionSchema = new Schema({
    trainerId: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    
    title: { type: String, required: true },
    description: { type: String },
    
    durationMinutes: { type: Number, required: true },
    price: { type: Number, required: true }, // Price in ETB
    
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    collection: "training_sessions"
});

// Indexes
trainingSessionSchema.index({ trainerId: 1 });
trainingSessionSchema.index({ gymId: 1 });

export const TrainingSession = mongoose.model<ITrainingSession>("TrainingSession", trainingSessionSchema);
