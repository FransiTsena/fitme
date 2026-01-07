import { Types } from 'mongoose';
import { Gym } from '../models/gymModel';
import { User } from '../models/userModel';

interface CreateGymData {
    ownerId: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone?: string;
    gymName?: string;
    description?: string;
    city: string;
    area: string;
    address?: string;
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
    images?: string[];
}

interface UpdateGymData {
    gymName?: string;
    description?: string;
    address?: string;
    city?: string;
    area?: string;
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
    images?: string[];
    status?: 'active' | 'suspended' | 'closed';
}

export const gymService = {
    // Create a new gym
    createGym: async (gymData: CreateGymData) => {
        try {
            // Check if user exists
            const user = await User.findById(gymData.ownerId);
            if (!user) {
                throw new Error('Owner does not exist');
            }

            // Check if a gym already exists for this owner
            const existingGym = await Gym.findOne({ ownerId: gymData.ownerId });
            if (existingGym) {
                throw new Error('A gym already exists for this owner');
            }

            const gym = new Gym(gymData);
            await gym.save();
            return gym;
        } catch (error) {
            throw error;
        }
    },

    // Get all gyms with optional filters
    getAllGyms: async (filters: { city?: string; area?: string; status?: string } = {}) => {
        try {
            const query: any = {};

            if (filters.city) query.city = new RegExp(filters.city, 'i');
            if (filters.area) query.area = new RegExp(filters.area, 'i');
            if (filters.status) query.status = filters.status;

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

    // Update gym status
    updateGymStatus: async (id: string, status: 'active' | 'suspended' | 'closed') => {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error('Invalid gym ID');
            }

            const gym = await Gym.findByIdAndUpdate(
                id,
                { status, updatedAt: new Date() },
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