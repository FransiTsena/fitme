
import axios from "axios";
import mongoose from "mongoose";
import { TrainerPromotion } from "../models/trainerModel.js";

const BASE_URL = "http://localhost:3005/api";
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fitme");
    }
}

async function runTest() {
    console.log("🚀 Starting Session Booking Test\n");

    let ownerId = "";
    let gymId = "";
    let planId = "";
    let memberId = "";
    let trainerUserId = "";
    let sessionId = "";
    let memberEmail = `booker_${Date.now()}@test.com`;

    // 1. SETUP: OWNER, GYM, PLAN, TRAINER, SESSION
    try {
        console.log("1. Setting up Infrastructure...");
        
        // Owner
        const ownerRes = await axios.post(`${BASE_URL}/users/signup`, {
            name: "Gym Owner Book",
            email: `owner_book_${Date.now()}@test.com`,
            password: "password123",
            role: "owner"
        });
        ownerId = ownerRes.data.user.id;

        // Gym
        const gymRes = await axios.post(`${BASE_URL}/gyms`, {
            ownerId,
            name: "Booking Gym",
            description: "Testing booking",
            location: { type: "Point", coordinates: [0, 0] },
            address: { city: "Test City", area: "Book Area", street: "Test St" }
        });
        gymId = gymRes.data.data._id;

        // Plan
        const planRes = await axios.post(`${BASE_URL}/memberships`, {
            gymId,
            ownerId,
            title: "Access Pass",
            durationInDays: 30,
            price: 1500
        });
        planId = planRes.data.plan._id;

        // Trainer Setup (Reuse logic: Signup -> Invite -> Accept)
        await connectDB();
        const trainerRes = await axios.post(`${BASE_URL}/users/signup`, {
            name: "Trainer Book",
            email: `trainer_book_${Date.now()}@test.com`,
            password: "password123",
            role: "member"
        });
        trainerUserId = trainerRes.data.user.id;
        
        await axios.post(`${BASE_URL}/trainers/invite`, { gymId, memberId: trainerUserId, ownerId });
        const promo = await TrainerPromotion.findOne({ memberId: trainerUserId, status: "pending" }).sort({ createdAt: -1 });
        if (promo) await axios.post(`${BASE_URL}/trainers/accept-invite`, { token: promo.token });

        // Create Session
        const sessionRes = await axios.post(`${BASE_URL}/training-sessions`, {
            userId: trainerUserId,
            title: "Yoga Flow",
            durationMinutes: 60,
            price: 300
        });
        sessionId = sessionRes.data.session._id;

        console.log(`✅ Infrastructure Ready. Gym: ${gymId}, Session: ${sessionId}`);

    } catch (e: any) {
        console.error("❌ Setup Failed:", e.response?.data || e.message);
        return;
    }

    await delay(500);

    // 2. CREATE MEMBER
    try {
        console.log("\n2. Creating Member...");
        const memberRes = await axios.post(`${BASE_URL}/users/signup`, {
            name: "Booker Member",
            email: memberEmail,
            password: "password123",
            role: "member"
        });
        memberId = memberRes.data.user.id;
        console.log(`✅ Member Created. ID: ${memberId}`);
    } catch (e: any) {
        console.error("❌ Member Signup Failed:", e.response?.data || e.message);
        return;
    }

    await delay(500);

    // 3. ATTEMPT BOOKING WITHOUT MEMBERSHIP (Should Fail)
    try {
        console.log("\n3. Attempting Booking WITHOUT Membership (Expect Failure)...");
        await axios.post(`${BASE_URL}/bookings/book`, {
            userId: memberId,
            sessionId,
            date: new Date().toISOString(),
            timeSlot: "10:00-11:00"
        });
        console.error("❌ Failed: Booking allowed for non-member!");
    } catch (e: any) {
        if (e.response && e.response.status === 400 && e.response.data.error.includes("membership required")) {
            console.log("✅ Success: Booking rejected as expected.");
        } else {
            console.error("❌ Failed: Error mismatch.", e.response?.data?.error || e.message);
        }
    }

    await delay(500);

    // 4. BUY MEMBERSHIP
    try {
        console.log("\n4. Purchasing Membership...");
        await axios.post(`${BASE_URL}/subscriptions/purchase`, {
            userId: memberId,
            planId
        });
        console.log("✅ Membership Purchased.");
    } catch (e: any) {
        console.error("❌ Purchase Failed:", e.response?.data || e.message);
        return;
    }

    await delay(500);

    // 5. ATTEMPT BOOKING WITH MEMBERSHIP (Should Succeed)
    try {
        console.log("\n5. Attempting Booking WITH Membership...");
        const res = await axios.post(`${BASE_URL}/bookings/book`, {
            userId: memberId,
            sessionId,
            date: new Date().toISOString(),
            timeSlot: "10:00-11:00"
        });
        console.log(`✅ Booking Successful! ID: ${res.data.data.booking._id}`);
    } catch (e: any) {
        console.error("❌ Booking Failed:", e.response?.data?.error || e.message);
        return;
    }

    console.log("\n✨ Session Booking Test Completed!");
    process.exit(0);
}

runTest();
