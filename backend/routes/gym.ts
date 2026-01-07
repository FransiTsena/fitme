import express from 'express';
import {
    createGym,
    getAllGyms,
    getGymById,
    getGymsByOwner,
    updateGym,
    deleteGym,
    updateGymStatus
} from '../controllers/gymController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// All gym routes
router.route('/')
    .post(requireAuth, createGym)  // Only authenticated users can create gyms
    .get(getAllGyms);              // Anyone can view all gyms

// Routes for specific gym
router.route('/:id')
    .get(getGymById)               // Anyone can view a specific gym
    .put(requireAuth, updateGym)   // Only authenticated users can update
    .delete(requireAuth, deleteGym); // Only authenticated users can delete

// Routes for gyms by owner
router.route('/owner/:ownerId')
    .get(requireAuth, getGymsByOwner); // Only authenticated users can view their own gyms

// Route to update gym status (for admin/owner)
router.route('/:id/status')
    .put(requireAuth, updateGymStatus);

export default router;