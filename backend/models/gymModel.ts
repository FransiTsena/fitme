import mongoose from "mongoose";

const gymSchema = new mongoose.Schema({
  // Owner reference
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  ownerPhone: { type: String },

  // Gym details
  gymName: { type: String },
  description: { type: String },
  
  // Location
  city: { type: String, required: true },
  area: { type: String, required: true },
  address: { type: String },
  
  // Verification details
  verifiedAt: { type: Date, default: Date.now },
  verifiedBy: { type: String }, // Admin user ID who verified
  verificationDocuments: [{ type: String }], // Copy of documents used for verification
  
  // Status
  status: { 
    type: String, 
    enum: ["active", "suspended", "closed"],
    default: "active" 
  },
  
  // Additional gym info (can be filled later by owner)
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  amenities: [{ type: String }],
  images: [{ type: String }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Index for efficient queries
gymSchema.index({ ownerId: 1 }, { unique: true });
gymSchema.index({ city: 1, area: 1 });
gymSchema.index({ status: 1 });

export const Gym = mongoose.models.Gym || mongoose.model("Gym", gymSchema);
