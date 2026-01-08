import { SessionBooking } from "../models/sessionBookingModel.js";
import { TrainingSession } from "../models/trainingSessionModel.js";
import { UserMembership } from "../models/userMembershipModel.js";
import { Payment } from "../models/paymentModel.js";
import { Types } from "mongoose";

export const sessionBookingService = {
    /**
     * Book a training session
     */
    bookSession: async (userId: string, sessionId: string, scheduledDate: Date, timeSlot: string) => {
        // 1. Fetch Session
        const session = await TrainingSession.findById(sessionId);
        if (!session) throw new Error("Training session not found");
        if (!session.isActive) throw new Error("Session is not active");

        // 2. CHECK MEMBERSHIP: User must have ACTIVE membership at this GYM
        const activeMembership = await UserMembership.findOne({
            userId,
            gymId: session.gymId,
            status: "active",
            endDate: { $gt: new Date() }
        });

        if (!activeMembership) {
            throw new Error("Active gym membership required to book sessions.");
        }

        // 3. Check Availability (Basic: Is trainer already booked?)
        // Assuming date is normalized (set to midnight or consistent time)
        const existingBooking = await SessionBooking.findOne({
            trainerId: session.trainerId,
            scheduledDate,
            timeSlot,
            status: "booked"
        });

        if (existingBooking) {
            throw new Error("Trainer is not available at this time slot.");
        }

        // 4. Create Payment (Stub)
        const payment = new Payment({
            userId,
            amount: session.price,
            currency: "ETB", 
            status: "completed",
            method: "in-app",
            type: "session"
        });
        await payment.save();


        // 5. Create Booking
        const booking = new SessionBooking({
            sessionId: session._id,
            trainerId: session.trainerId,
            memberId: userId,
            gymId: session.gymId,
            paymentId: payment._id,
            scheduledDate,
            timeSlot,
            status: "booked"
        });

        await booking.save();

        return { booking, payment };
    },

    /**
     * Get Member's Bookings
     */
    getMemberBookings: async (memberId: string) => {
        return await SessionBooking.find({ memberId })
            .populate("sessionId", "title durationMinutes")
            .populate("trainerId", "specialization") // Need to populate user from trainer if we want name
            .sort({ scheduledDate: -1 });
    }
};
