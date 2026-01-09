import express from 'express';
import {
    createGym,
    getAllGyms,
    getGymById,
    getGymsByOwner,
    updateGym,
    deleteGym,
    updateGymVerificationStatus,
    getGymMembers,
    getGymTrainers,
    getNearbyGyms
} from '../controllers/gymController.js';

import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// All gym routes
router.route('/')
    .post(createGym)  // Auth removed for testing
    .get(getAllGyms);              // Anyone can view all gyms

// Get nearby gyms - MUST come before /:id to avoid conflict
router.get('/nearby', getNearbyGyms);

// Routes for gyms by owner - MUST come before /:id to avoid conflict
router.get('/owner/:ownerId', requireAuth, getGymsByOwner);

// Routes for specific gym
router.route('/:id')
    .get(getGymById)               // Anyone can view a specific gym
    .put(updateGym)                // Auth removed for testing
    .delete(deleteGym);            // Auth removed for testing

// Route to update gym verification status (for admin)
router.put('/:id/verification-status', updateGymVerificationStatus);

// Routes for gym members and trainers
router.get('/:gymId/members', requireAuth, getGymMembers);
router.get('/:gymId/trainers', requireAuth, getGymTrainers);


export default router;