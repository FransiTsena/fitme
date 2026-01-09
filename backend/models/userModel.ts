import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    image: { type: String }, // Provided by Better Auth default
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    // Custom Fields
    fatherName: { type: String },
    phone: { type: String },
    role: {
        type: String,
        enum: ["owner", "trainer", "member",],
        default: "member"
    },
    status: { type: String, default: "active" }, // active | pending | suspended
    city: { type: String },
    area: { type: String },
    profileImage: { type: String }, // Dedicated field for profile picture

    // Owner Document Verification Fields
    ownerDocuments: [{ type: String }], // Array of document URLs
    documentStatus: {
        type: String,
        enum: ["not_submitted", "pending", "approved", "rejected"],
        default: "not_submitted"
    },
    documentSubmittedAt: { type: Date },
    documentReviewedAt: { type: Date },
    documentReviewedBy: { type: String }, // Admin user ID who reviewed
    documentReviewNotes: { type: String }, // Notes from admin review
}, {
    timestamps: true,
    collection: "user" // Force singular to match Better Auth
});


export interface IUser {
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
    fatherName?: string;
    phone?: string;
    role: string;
    status: string;
    city?: string;
    area?: string;
    profileImage?: string;
    ownerDocuments?: string[];
    documentStatus: "not_submitted" | "pending" | "approved" | "rejected";
    documentSubmittedAt?: Date;
    documentReviewedAt?: Date;
    documentReviewedBy?: string;
    documentReviewNotes?: string;
}

export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", userSchema);

