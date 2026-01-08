import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPayment extends Document {
    userId: Types.ObjectId;
    amount: number;
    currency: string;
    status: "pending" | "completed" | "failed";
    method: "in-app" | "manual"; 
    type: "membership" | "session" | "other";
    createdAt: Date;
}


const paymentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "ETB" },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" }, // Stubbed to completed
    method: { type: String, default: "in-app" },
    type: { type: String, enum: ["membership", "session", "other"], required: true }
}, {

    timestamps: true,
    collection: "payments"
});

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
