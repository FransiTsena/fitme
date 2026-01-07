import type { Request, Response } from 'express';
import { gymService } from '../services/gymService.js';

export const createGym = async (req: Request, res: Response) => {
    try {
        const {
            ownerId,
            ownerName,
            ownerEmail,
            ownerPhone,
            gymName,
            description,
            city,
            area,
            address,
            operatingHours,
            amenities,
            images
        } = req.body;

        if (!ownerId || !ownerName || !ownerEmail || !city || !area) {
            return res.status(400).json({
                success: false,
                message: 'Owner ID, name, email, city, and area are required'
            });
        }

        const gymData = {
            ownerId,
            ownerName,
            ownerEmail,
            ownerPhone,
            gymName,
            description,
            city,
            area,
            address,
            operatingHours,
            amenities,
            images
        };

        const gym = await gymService.createGym(gymData);
        res.status(201).json({
            success: true,
            message: 'Gym created successfully',
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
        const { city, area, status } = req.query;

        const filters: { city?: string; area?: string; status?: string } = {};

        if (city) filters.city = city as string;
        if (area) filters.area = area as string;
        if (status) filters.status = status as string;

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

export const updateGymStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Gym ID is required'
            });
        }

        if (!['active', 'suspended', 'closed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be active, suspended, or closed'
            });
        }

        const gym = await gymService.updateGymStatus(id, status);
        res.status(200).json({
            success: true,
            message: `Gym status updated to ${status}`,
            data: gym
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};