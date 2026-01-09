import { Types } from 'mongoose';
import { Gym } from '../models/gymModel.js';
import { User } from '../models/userModel.js';
import { UserMembership } from '../models/userMembershipModel.js';
import { Trainer } from '../models/trainerModel.js';

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

    // Get all members of a gym
    getGymMembers: async (gymId: string, filters: { status?: string; search?: string } = {}) => {
        try {
            if (!Types.ObjectId.isValid(gymId)) {
                throw new Error('Invalid gym ID');
            }

            const query: any = { gymId: new Types.ObjectId(gymId) };
            
            if (filters.status && filters.status !== 'all') {
                query.status = filters.status;
            }

            const memberships = await UserMembership.find(query)
                .populate('userId', 'name email phone profileImage city')
                .populate('planId', 'title price')
                .sort({ createdAt: -1 });

            // Filter by search term if provided
            let members = memberships.map(m => {
                const user = m.userId as any;
                const plan = m.planId as any;
                return {
                    _id: m._id,
                    id: m._id,
                    userId: user?._id,
                    name: user?.name || 'Unknown',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    profileImage: user?.profileImage || null,
                    city: user?.city || '',
                    plan: plan?.title || 'Unknown',
                    planPrice: plan?.price || 0,
                    status: m.status,
                    startDate: m.startDate,
                    endDate: m.endDate,
                    joinedAt: m.createdAt,
                };
            });

            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                members = members.filter(m => 
                    m.name.toLowerCase().includes(searchLower) ||
                    m.email.toLowerCase().includes(searchLower)
                );
            }

            return members;
        } catch (error) {
            throw error;
        }
    },

    // Get all trainers of a gym
    getGymTrainers: async (gymId: string, filters: { status?: string; search?: string } = {}) => {
        try {
            if (!Types.ObjectId.isValid(gymId)) {
                throw new Error('Invalid gym ID');
            }

            const query: any = { gymId: new Types.ObjectId(gymId) };
            
            if (filters.status === 'active') {
                query.isActive = true;
            } else if (filters.status === 'inactive') {
                query.isActive = false;
            }

            const trainers = await Trainer.find(query)
                .populate('userId', 'name email phone profileImage city')
                .sort({ createdAt: -1 });

            // Transform and filter
            let trainerList = trainers.map(t => {
                const user = t.userId as any;
                return {
                    _id: t._id,
                    id: t._id,
                    trainerId: t._id,
                    userId: user?._id,
                    name: user?.name || 'Unknown',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    profileImage: user?.profileImage || null,
                    city: user?.city || '',
                    specialization: t.specialization || [],
                    bio: t.bio || '',
                    rating: t.rating?.average || 0,
                    reviewCount: t.rating?.count || 0,
                    isActive: t.isActive,
                    promotedAt: t.promotedAt,
                    joinedAt: t.createdAt,
                };
            });

            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                trainerList = trainerList.filter(t => 
                    t.name.toLowerCase().includes(searchLower) ||
                    t.email.toLowerCase().includes(searchLower) ||
                    t.specialization.some((s: string) => s.toLowerCase().includes(searchLower))
                );
            }

            return trainerList;
        } catch (error) {
            throw error;
        }
    },
};
