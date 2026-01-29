import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPlanExercise {
    exerciseId: Types.ObjectId;
    sets: number;
    reps: number;
    weight?: number;
    order: number;
    notes?: string;
}

export interface IWorkoutDay {
    dayNumber: number; // 1, 2, 3...
    title?: string; // e.g., "Chest & Triceps"
    exercises: IPlanExercise[];
}

export interface IWorkoutPlan extends Document {
    ownerId: Types.ObjectId; // User who owns this plan
    name: string;
    description?: string;
    isTemplate: boolean; // True if this is a reusable template
    gymId?: Types.ObjectId; // Optional: associated with a specific gym
    days: IWorkoutDay[];
    createdAt: Date;
    updatedAt: Date;
}

const planExerciseSchema = new Schema({
    exerciseId: { type: Schema.Types.ObjectId, ref: "Exercise", required: true },
    sets: { type: Number, required: true },
    reps: { type: Number, required: true },
    weight: { type: Number },
    order: { type: Number, required: true },
    notes: { type: String }
}, { _id: false });

const workoutDaySchema = new Schema({
    dayNumber: { type: Number, required: true },
    title: { type: String },
    exercises: [planExerciseSchema]
}, { _id: false });

const workoutPlanSchema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    isTemplate: { type: Boolean, default: false },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym" },
    days: [workoutDaySchema]
}, {
    timestamps: true,
    collection: "workout_plans"
});

workoutPlanSchema.index({ ownerId: 1 });
workoutPlanSchema.index({ isTemplate: 1 });

export const WorkoutPlan = mongoose.model<IWorkoutPlan>("WorkoutPlan", workoutPlanSchema);
