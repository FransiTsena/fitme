import mongoose, { Schema, Document } from "mongoose";

export interface IExercise extends Document {
    name: string;
    description?: string;
    category: string; // e.g., Strength, Cardio, Flexibility
    bodyPart: string; // e.g., Chest, Back, Legs
    equipment?: string; // e.g., Dumbbell, Barbell, None
    instructions?: string[];
    demoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const exerciseSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    category: { type: String, required: true },
    bodyPart: { type: String, required: true },
    equipment: { type: String },
    instructions: [{ type: String }],
    demoUrl: { type: String }
}, {
    timestamps: true,
    collection: "exercises"
});

exerciseSchema.index({ category: 1 });
exerciseSchema.index({ bodyPart: 1 });

export const Exercise = mongoose.model<IExercise>("Exercise", exerciseSchema);
