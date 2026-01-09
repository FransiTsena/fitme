import mongoose from "mongoose";

const gymSchema = new mongoose.Schema({
  // Owner who registered the gym
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Basic gym info
  name: { type: String, required: true },
  description: { type: String },

  // Location for map & nearby search
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },


  // Rating info
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },

  // Optional human-readable address
  address: {
    city: { type: String, required: true },
    area: { type: String, required: true },
    street: { type: String } // Added street for completeness
  },

  // Gym images
  photos: [{ type: String }],

  // Verification & visibility
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  isActive: { type: Boolean, default: false },

  // Verification document URL
  verificationDocument: { type: String },

  // Custom data (operating hours, amenities etc)
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

  // Pricing
  pricing: {
    perDay: { type: Number, default: 0 },
    perMonth: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

// Indexes
gymSchema.index({ ownerId: 1 }, { unique: true });
gymSchema.index({ location: "2dsphere" });
gymSchema.index({ "address.city": 1, "address.area": 1 });
gymSchema.index({ verificationStatus: 1 });

export interface IGym {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  rating: {
    average: number;
    count: number;
  };
  address: {
    city: string;
    area: string;
    street?: string;
  };
  photos?: string[];
  verificationStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
  verificationDocument?: string;
  operatingHours?: {
    monday?: { open?: string; close?: string };
    tuesday?: { open?: string; close?: string };
    wednesday?: { open?: string; close?: string };
    thursday?: { open?: string; close?: string };
    friday?: { open?: string; close?: string };
    saturday?: { open?: string; close?: string };
    sunday?: { open?: string; close?: string };
  };
  amenities?: string[];
  pricing?: {
    perDay: number;
    perMonth: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const Gym = (mongoose.models.Gym as mongoose.Model<IGym>) || mongoose.model<IGym>("Gym", gymSchema);


