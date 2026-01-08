import { type Request, type Response } from "express";
import { sessionBookingService } from "../services/sessionBookingService.js";

export const bookSession = async (req: Request, res: Response) => {
    try {
        const { sessionId, date, timeSlot } = req.body;
        const userId = req.user?.id || req.body.userId; // Fallback

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!sessionId || !date || !timeSlot) {
            return res.status(400).json({ error: "Missing required fields: sessionId, date, timeSlot" });
        }

        // Normalize date (ensure it's a valid date object)
        const scheduledDate = new Date(date);
        if (isNaN(scheduledDate.getTime())) {
             return res.status(400).json({ error: "Invalid date format" });
        }

        const result = await sessionBookingService.bookSession(userId, sessionId, scheduledDate, timeSlot);

        res.status(201).json({
            message: "Session booked successfully",
            data: result
        });

    } catch (error: any) {
        console.error("Booking Error:", error);
        res.status(400).json({ error: error.message });
    }
};

export const getMyBookings = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id || req.query.userId as string;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const bookings = await sessionBookingService.getMemberBookings(userId);
        res.status(200).json({ bookings });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
