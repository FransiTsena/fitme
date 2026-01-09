import express from "express";
import { bookSession, getMyBookings, getTrainerBookings, updateBookingStatus } from "../controllers/sessionBookingController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

console.log("🛠️ Loading Booking Routes...");

// Book a session (requires auth)
router.post("/book", requireAuth, bookSession);

// Get my bookings (for members - requires auth)
router.get("/my", requireAuth, getMyBookings);

// Get trainer's bookings (requires auth)
router.get("/trainer", requireAuth, getTrainerBookings);

// Update booking status (complete/cancel - requires auth)
router.patch("/:id/status", requireAuth, updateBookingStatus);

export default router;
