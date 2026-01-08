import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISessionBooking extends Document {
    sessionId: Types.ObjectId;
    trainerId: Types.ObjectId;
    memberId: Types.ObjectId;
    gymId: Types.ObjectId;
    paymentId: Types.ObjectId;
    
    scheduledDate: Date;
    timeSlot: string;
    
    status: "booked" | "completed" | "cancelled";
    createdAt: Date;
    updatedAt: Date;
}

const sessionBookingSchema = new Schema({
    sessionId: { type: Schema.Types.ObjectId, ref: "TrainingSession", required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    memberId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", required: true },
    
    scheduledDate: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g. "10:00-11:00"
    
    status: { 
        type: String, 
        enum: ["booked", "completed", "cancelled"], 
        default: "booked" 
    }
}, {
    timestamps: true,
    collection: "session_bookings"
});

// Index for checking availability (trainer + date + slot)
sessionBookingSchema.index({ trainerId: 1, scheduledDate: 1, timeSlot: 1 });

export const SessionBooking = mongoose.model<ISessionBooking>("SessionBooking", sessionBookingSchema);
