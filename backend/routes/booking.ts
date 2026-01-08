import express from "express";
import { bookSession, getMyBookings } from "../controllers/sessionBookingController.js";

const router = express.Router();

console.log("🛠️ Loading Booking Routes...");

// Book a session
router.post("/book", bookSession);

// Get my bookings
router.get("/my", getMyBookings);

export default router;
