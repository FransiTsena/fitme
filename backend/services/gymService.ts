import { Types } from 'mongoose';
import { Gym } from '../models/gymModel.js';
import { User } from '../models/userModel.js';

interface CreateGymData {
    ownerId: string;
    name: string;
    description?: string;
    location: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
    address: {
        city: string;
        area: string;
        street?: string;
    };
    photos?: string[];
    operatingHours?: {
        monday?: { open: string; close: string };
        tuesday?: { open: string; close: string };
        wednesday?: { open: string; close: string };
        thursday?: { open: string; close: string };
        friday?: { open: string; close: string };
        saturday?: { open: string; close: string };
        sunday?: { open: string; close: string };
    };
    amenities?: string[];
}

interface UpdateGymData {
    name?: string;
    description?: string;
    location?: {
        type: "Point";
        coordinates: [number, number];
    };
    address?: {
        city?: string;
        area?: string;
        street?: string;
    };
    photos?: string[];
    operatingHours?: {
        monday?: { open: string; close: string };
        tuesday?: { open: string; close: string };
        wednesday?: { open: string; close: string };
        thursday?: { open: string; close: string };
        friday?: { open: string; close: string };
        saturday?: { open: string; close: string };
        sunday?: { open: string; close: string };
    };
    amenities?: string[];
    verificationStatus?: 'pending' | 'approved' | 'rejected';
    isActive?: boolean;
}

export const gymService = {
    // Create a new gym
    createGym: async (gymData: CreateGymData) => {
        try {
            console.log("Creating gym for owner ID:", gymData.ownerId);
            
            // Explicitly cast and validate ownerId
            let ownerObjectId: Types.ObjectId;
            try {
                ownerObjectId = new Types.ObjectId(gymData.ownerId);
            } catch (err) {
                throw new Error('Invalid Owner ID format');
            }

            // Check if user exists
            const user = await User.findById(ownerObjectId);
            if (!user) {
                throw new Error('Owner does not exist');
            }

            // Check if a gym already exists for this owner
            const existingGym = await Gym.findOne({ ownerId: ownerObjectId });
            if (existingGym) {
                throw new Error('A gym already exists for this owner');
            }

            const gym = new Gym({
                ...gymData,
                ownerId: ownerObjectId, // Ensure casted ID is used
                verificationStatus: 'pending',
                isActive: false,
                rating: { average: 0, count: 0 }
            });

            console.log("Saving gym to DB...");
            await gym.save();
            console.log("✅ Gym saved successfully");
            return gym;
        } catch (error: any) {
            console.error("❌ Gym Creation Error:", error.message);
            if (error.name === 'ValidationError') {
                console.error("Validation Details:", JSON.stringify(error.errors, null, 2));
            }
            throw error;
        }
    },


    // Get all gyms with optional filters
    getAllGyms: async (filters: { city?: string; area?: string; isActive?: boolean } = {}) => {
        try {
            const query: any = {};

            if (filters.city) query['address.city'] = new RegExp(filters.city, 'i');
            if (filters.area) query['address.area'] = new RegExp(filters.area, 'i');
            if (filters.isActive !== undefined) query.isActive = filters.isActive;

            const gyms = await Gym.find(query).populate('ownerId', 'name email phone');
            return gyms;
        } catch (error) {
            throw error;
        }
    },

    // Get gym by ID
    getGymById: async (id: string) => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid gym ID');
            }

            const gym = await Gym.findById(id).populate('ownerId', 'name email phone');
            if (!gym) {
                throw new Error('Gym not found');
            }

            return gym;
        } catch (error) {
            throw error;
        }
    },

    // Get gyms by owner ID
    getGymsByOwner: async (ownerId: string) => {
        try {
            if (!Types.ObjectId.isValid(ownerId)) {
                throw new Error('Invalid owner ID');
            }

            const gyms = await Gym.find({ ownerId }).populate('ownerId', 'name email phone');
            return gyms;
        } catch (error) {
            throw error;
        }
    },

    // Update gym by ID
    updateGym: async (id: string, updateData: UpdateGymData) => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid gym ID');
            }

            const gym = await Gym.findByIdAndUpdate(
                id,
                { ...updateData, updatedAt: new Date() },
                { new: true, runValidators: true }
            ).populate('ownerId', 'name email phone');

            if (!gym) {
                throw new Error('Gym not found');
            }

            return gym;
        } catch (error) {
            throw error;
        }
    },

    // Delete gym by ID
    deleteGym: async (id: string) => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid gym ID');
            }

            const gym = await Gym.findByIdAndDelete(id);
            if (!gym) {
                throw new Error('Gym not found');
            }

            return gym;
        } catch (error) {
            throw error;
        }
    },

    // Get nearby gyms based on location
    getNearbyGyms: async (latitude: number, longitude: number, maxDistanceKm: number = 10) => {
        try {
            const maxDistanceInMeters = maxDistanceKm * 1000; // Convert km to meters
            
            const gyms = await Gym.find({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude] // GeoJSON format: [longitude, latitude]
                        },
                        $maxDistance: maxDistanceInMeters
                    }
                },
                isActive: true, // Only return active gyms
                verificationStatus: 'approved' // Only return approved gyms
            }).populate('ownerId', 'name email phone');
            
            return gyms;
        } catch (error) {
            throw error;
        }
    },

    // Update gym verification status
    updateVerificationStatus: async (id: string, status: 'approved' | 'rejected', isActive?: boolean) => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid gym ID');
            }

            const update: any = { verificationStatus: status, updatedAt: new Date() };
            if (isActive !== undefined) update.isActive = isActive;
            else if (status === 'approved') update.isActive = true;
            else if (status === 'rejected') update.isActive = false;

            const gym = await Gym.findByIdAndUpdate(
                id,
                update,
                { new: true, runValidators: true }
            ).populate('ownerId', 'name email phone');

            if (!gym) {
                throw new Error('Gym not found');
            }

            return gym;
        } catch (error) {
            throw error;
        }
    },
};
