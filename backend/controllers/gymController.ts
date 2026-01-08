import type { Request, Response } from 'express';
import { gymService } from '../services/gymService.js';

export const createGym = async (req: Request, res: Response) => {
    try {
        const {
            ownerId,
            name,
            description,
            location, // { type: "Point", coordinates: [lng, lat] }
            address,  // { city, area, street }
            photos,
            operatingHours,
            amenities
        } = req.body;

        if (!ownerId || !name || !location || !address?.city || !address?.area) {
            return res.status(400).json({
                success: false,
                message: 'Owner ID, name, location, city, and area are required'
            });
        }

        const gymData = {
            ownerId,
            name,
            description,
            location,
            address,
            photos,
            operatingHours,
            amenities
        };

        const gym = await gymService.createGym(gymData);
        res.status(201).json({
            success: true,
            message: 'Gym created successfully. Pending verification.',
            data: gym
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllGyms = async (req: Request, res: Response) => {
    try {
        const { city, area, isActive } = req.query;

        const filters: { city?: string; area?: string; isActive?: boolean } = {};

        if (city) filters.city = city as string;
        if (area) filters.area = area as string;
        if (isActive !== undefined) filters.isActive = isActive === 'true';

        const gyms = await gymService.getAllGyms(filters);
        res.status(200).json({
            success: true,
            data: gyms
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getGymById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Gym ID is required'
            });
        }

        const gym = await gymService.getGymById(id);
        res.status(200).json({
            success: true,
            data: gym
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const getGymsByOwner = async (req: Request, res: Response) => {
    try {
        const { ownerId } = req.params;

        if (!ownerId) {
            return res.status(400).json({
                success: false,
                message: 'Owner ID is required'
            });
        }

        const gyms = await gymService.getGymsByOwner(ownerId);
        res.status(200).json({
            success: true,
            data: gyms
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const updateGym = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Gym ID is required'
            });
        }

        const gym = await gymService.updateGym(id, updateData);
        res.status(200).json({
            success: true,
            message: 'Gym updated successfully',
            data: gym
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteGym = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Gym ID is required'
            });
        }

        const gym = await gymService.deleteGym(id);
        res.status(200).json({
            success: true,
            message: 'Gym deleted successfully',
            data: gym
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const updateGymVerificationStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, isActive } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Gym ID is required'
            });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be approved or rejected'
            });
        }

        const gym = await gymService.updateVerificationStatus(id, status, isActive);
        res.status(200).json({
            success: true,
            message: `Gym verification status updated to ${status}`,
            data: gym
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};
