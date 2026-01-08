
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
    console.log("🚀 Starting Analytics Dashboard Test\n");

    let ownerId = "";
    let gymId = "";
    let planId = "";
    let memberId = "";
    let trainerUserId = "";
    let sessionId = "";
    const memberEmail = `ana_member_${Date.now()}@test.com`;

    // 1. SETUP EVERYTHING (Gym, Owner, Plan, Trainer, Member, Purchase, Booking)
    try {
        console.log("1. Setting up Full Gym Environment...");
        
        // Owner
        const ownerRes = await axios.post(`${BASE_URL}/users/signup`, {
            name: "Analytics Owner",
            email: `ana_owner_${Date.now()}@test.com`,
            password: "password123",
            role: "owner"
        });
        ownerId = ownerRes.data.user.id;

        // Gym
        const gymRes = await axios.post(`${BASE_URL}/gyms`, {
            ownerId,
            name: "Analytics Data Gym",
            description: "Big Data",
            location: { type: "Point", coordinates: [0, 0] },
            address: { city: "Data City", area: "Analytics Area", street: "Bit St" }
        });
        gymId = gymRes.data.data._id;

        // Plan
        const planRes = await axios.post(`${BASE_URL}/memberships`, {
            gymId,
            ownerId,
            title: "Data Plan",
            durationInDays: 30,
            price: 1000
        });
        planId = planRes.data.plan._id;

        // Trainer
        await connectDB();
        const trainerRes = await axios.post(`${BASE_URL}/users/signup`, {
            name: "Data Trainer",
            email: `ana_trainer_${Date.now()}@test.com`,
            password: "password123",
            role: "member"
        });
        trainerUserId = trainerRes.data.user.id;
        await axios.post(`${BASE_URL}/trainers/invite`, { gymId, memberId: trainerUserId, ownerId });
        const promo = await TrainerPromotion.findOne({ memberId: trainerUserId, status: "pending" }).sort({ createdAt: -1 });
        if (promo) await axios.post(`${BASE_URL}/trainers/accept-invite`, { token: promo.token });

        // Session
        const sessionRes = await axios.post(`${BASE_URL}/training-sessions`, {
            userId: trainerUserId,
            title: "Deep Learning Yoga",
            durationMinutes: 60,
            price: 500
        });
        sessionId = sessionRes.data.session._id;

        // Member
        const memberRes = await axios.post(`${BASE_URL}/users/signup`, {
            name: "Stats Member",
            email: memberEmail,
            password: "password123",
            role: "member"
        });
        memberId = memberRes.data.user.id;

        // Purchase Membership (Generates Revenue type: 'membership')
        await axios.post(`${BASE_URL}/subscriptions/purchase`, {
            userId: memberId,
            planId
        });

        // Book Session (Generates Revenue type: 'session')
        await axios.post(`${BASE_URL}/bookings/book`, {
            userId: memberId,
            sessionId,
            date: new Date().toISOString(),
            timeSlot: "12:00-13:00"
        });

        console.log(`✅ Environment Ready! GymID: ${gymId}`);
        console.log(`   - 1 Active Member`);
        console.log(`   - 1 Active Trainer`);
        console.log(`   - Revenue Expected: 1000 (Plan) + 500 (Session) = 1500`);

    } catch (e: any) {
        console.error("❌ Setup Failed:", e.response?.data || e.message);
        return;
    }

    await delay(1000); // Allow DB to sync/index if needed

    // 2. FETCH ANALYTICS DASHBOARD
    try {
        console.log("\n2. Fetching Analytics Dashboard...");
        const res = await axios.get(`${BASE_URL}/analytics/gym/${gymId}`);
        const data = res.data.data;

        console.log("📊 Dashboard Data Received:");
        console.log(JSON.stringify(data, null, 2));

        // Validation
        if (data.gymPerformance.activeMembers !== 1) console.error("❌ Stats Mismatch: Active Members");
        else console.log("✅ Active Members: Correct (1)");

        if (data.revenue.total !== 1500) console.error(`❌ Stats Mismatch: Revenue (Expected 1500, Got ${data.revenue.total})`);
        else console.log("✅ Total Revenue: Correct (1500)");

        const memRev = data.revenue.byType.find((r: any) => r._id === "membership");
        const sessRev = data.revenue.byType.find((r: any) => r._id === "session");
        
        if (memRev?.total === 1000 && sessRev?.total === 500) console.log("✅ Revenue Breakdown: Correct");
        else console.error("❌ Revenue Breakdown Failed");

    } catch (e: any) {
        console.error("❌ Fetch Owner Analytics Failed:", e.response?.data || e.message);
    }

    await delay(500);

    // 3. FETCH TRAINER ANALYTICS
    try {
        console.log("\n3. Fetching Trainer Analytics...");
        // Use trainerUserId to simulate auth context for the trainer
        // In real app, we'd login as trainer to get token. 
        // For test, we can pass ?userId=... if we enabled that fallback in controller.
        const res = await axios.get(`${BASE_URL}/analytics/trainer?userId=${trainerUserId}`);
        const data = res.data.data;

        console.log("📊 Trainer Dashboard Data:");
        console.log(JSON.stringify(data, null, 2));

        // Verification
        /*
          Expected:
          - Sessions: 
              - Total Conducted (completed): 0 (We haven't marked any as completed yet!)
              - Upcoming: 1 (The booking we made is for future if we did Date.now() + 1 hour approx, 
                             actually in runTest we did new Date().toISOString()... 
                             The booking date might be considered "past" or "future" depending on execution time vs creation time.
                             Actually, we set it to 'new Date().toISOString()', which is effectively 'Now'.
                             So it might not be 'gt' Now(). Let's adjust booking time in setup if needed.)
              - Cancelled: 0
        */
       
       // Let's create a Completed Session to verify counts
       // We need to mark the 'sessionId' booking as 'completed'.
       // But wait, we don't have the bookingId in top scope.
       // Let's just create a NEW booking and mark it complete for testing.
       
       const bookingRes = await axios.post(`${BASE_URL}/bookings/book`, {
            userId: memberId,
            sessionId,
            date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            timeSlot: "10:00-11:00"
       });
       const bookingId = bookingRes.data.data.booking._id;

       // Manually update status to 'completed' (We don't have an endpoint for this yet, so direct DB update)
       await connectDB();
       // Dynamic import to avoid type issues if models not loaded
       const { SessionBooking } = await import("../models/sessionBookingModel.js");
       await SessionBooking.findByIdAndUpdate(bookingId, { status: "completed" });

       // Now fetch again
       const res2 = await axios.get(`${BASE_URL}/analytics/trainer?userId=${trainerUserId}`);
       const result = res2.data.data;

       if (result.sessions.totalConducted === 1) console.log("✅ Total Conducted: Correct (1)");
       else console.error(`❌ Total Conducted Mismatch: Got ${result.sessions.totalConducted}`);

    } catch (e: any) {
        console.error("❌ Fetch Trainer Analytics Failed:", e.response?.data || e.message);
    }

    console.log("\n✨ Analytics Test Completed!");
    process.exit(0);
}


runTest();
