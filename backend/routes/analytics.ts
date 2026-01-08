import express from "express";
import { getGymAnalytics, getTrainerAnalytics } from "../controllers/analyticsController.js";


const router = express.Router();

console.log("🛠️ Loading Analytics Routes...");

// Get Gym Dashboard (Owner)
router.get("/gym/:gymId", getGymAnalytics);

// Get Trainer Dashboard
router.get("/trainer", getTrainerAnalytics);

export default router;

