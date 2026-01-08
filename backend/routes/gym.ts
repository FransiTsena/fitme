import express from 'express';
import {
    createGym,
    getAllGyms,
    getGymById,
    getGymsByOwner,
    updateGym,
    deleteGym,
    updateGymVerificationStatus
} from '../controllers/gymController.js';

import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// All gym routesu
router.route('/')
    .post(createGym)  // Auth removed for testing
    .get(getAllGyms);              // Anyone can view all gyms

// Routes for specific gym
router.route('/:id')
    .get(getGymById)               // Anyone can view a specific gym
    .put(updateGym)                // Auth removed for testing
    .delete(deleteGym);            // Auth removed for testing


// Routes for gyms by owner
router.route('/owner/:ownerId')
    .get(requireAuth, getGymsByOwner); // Only authenticated users can view their own gyms

// Route to update gym verification status (for admin)
router.route('/:id/verification-status')
    .put(updateGymVerificationStatus); // Auth removed for testing


export default router;