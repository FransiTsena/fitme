
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
    console.log("🚀 Starting Training Session Creation Test\n");

    let ownerId = "";
    let gymId = "";
    let memberId = "";
    let trainerUserId = "";
    let sessionId = "";
    
    // Use unique email to avoid conflicts or use existing logic
    const memberEmail = `trainer_candidate_${Date.now()}@test.com`; 

    // 1. SETUP: OWNER & GYM
    try {
        console.log("1. Setting up Gym & Owner...");
        const ownerRes = await axios.post(`${BASE_URL}/users/signup`, {
            name: "Gym Owner",
            email: `owner_${Date.now()}@test.com`,
            password: "password123",
            role: "owner"
        });
        ownerId = ownerRes.data.user.id;

        const gymRes = await axios.post(`${BASE_URL}/gyms`, {
            ownerId,
            name: "Training Session Gym",
            description: "Testing sessions",
            location: { type: "Point", coordinates: [0, 0] },
            address: { city: "Test City", area: "Test Area", street: "Test St" }
        });
        gymId = gymRes.data.data._id;
        console.log(`✅ Gym Created! ID: ${gymId}`);
    } catch (e: any) {
        console.error("❌ Setup Failed:", e.response?.data || e.message);
        return;
    }

    await delay(500);

    // 2. SETUP: CREATE TRAINER (Full Flow)
    try {
        console.log("\n2. Creating & Promoting Trainer...");
        // Signup Member
        const memberRes = await axios.post(`${BASE_URL}/users/signup`, {
            name: "Future Trainer",
            email: memberEmail,
            password: "password123",
            role: "member"
        });
        memberId = memberRes.data.user.id;
        trainerUserId = memberId;

        // Invite
        await axios.post(`${BASE_URL}/trainers/invite`, {
            gymId,
            memberId,
            ownerId // Dev bypass
        });

        // Get Token via DB
        await connectDB();
        const promo = await TrainerPromotion.findOne({ memberId, status: "pending" }).sort({ createdAt: -1 });
        if (!promo) throw new Error("Promotion not found");
        
        // Accept
        await axios.post(`${BASE_URL}/trainers/accept-invite`, { token: promo.token });
        console.log(`✅ Trainer Promoted! UserID: ${trainerUserId}`);
    } catch (e: any) {
        console.error("❌ Trainer Promotion Failed:", e.response?.data || e.message);
        return;
    }

    await delay(500);

    // 3. CREATE TRAINING SESSION
    try {
        console.log("\n3. Creating Training Session...");
        const sessionData = {
            userId: trainerUserId, // Passed explicitly for Dev/Test (auth usually provides this)
            title: "HIIT Blast",
            description: "High intensity interval training",
            durationMinutes: 45,
            price: 500
        };

        const res = await axios.post(`${BASE_URL}/training-sessions`, sessionData);
        sessionId = res.data.session._id;
        console.log(`✅ Session Created! ID: ${sessionId}`);
        console.log(`   Title: ${res.data.session.title}, Price: ${res.data.session.price}`);
    } catch (e: any) {
        console.error("❌ Create Session Failed:", e.response?.data || e.message);
        return;
    }

    await delay(500);

    // 4. VERIFY FETCH BY GYM
    try {
        console.log("\n4. Fetching Gym Sessions (Before Update)...");
        const res = await axios.get(`${BASE_URL}/training-sessions/gym/${gymId}`);
        const found = res.data.sessions.some((s: any) => s.title === "HIIT Blast");
        if (found) {
            console.log(`✅ Session found in public gym listing.`);
        } else {
            console.error("❌ Session NOT found in listing.");
        }
    } catch (e: any) {
        console.error("❌ Fetch Sessions Failed:", e.response?.data || e.message);
    }

    await delay(500);

    // 5. UPDATE SESSION
    try {
        console.log("\n5. Updating Session...");
        const res = await axios.put(`${BASE_URL}/training-sessions/${sessionId}`, {
            title: "HIIT Blast PRO",
            price: 750
        });
        console.log(`✅ Session Updated! New Title: ${res.data.session.title}, New Price: ${res.data.session.price}`);
    } catch (e: any) {
        console.error("❌ Update Session Failed:", e.response?.data || e.message);
    }

    await delay(500);

    // 6. DISABLE SESSION (HIDE FROM PUBLIC)
    try {
        console.log("\n6. Disabling Session...");
        const res = await axios.patch(`${BASE_URL}/training-sessions/${sessionId}/status`, {
            isActive: false
        });
        console.log(`✅ Session Disabled! active: ${res.data.session.isActive}`);
    } catch (e: any) {
        console.error("❌ Disable Session Failed:", e.response?.data || e.message);
    }

    await delay(500);

    // 7. VERIFY HIDDEN
    try {
        console.log("\n7. Fetching Gym Sessions (After Disable)...");
        const res = await axios.get(`${BASE_URL}/training-sessions/gym/${gymId}`);
        const found = res.data.sessions.some((s: any) => s._id === sessionId);
        if (!found) {
            console.log(`✅ Success: Disabled session is hidden from public view.`);
        } else {
            console.error("❌ Failed: Disabled session is STILL visible.");
        }
    } catch (e: any) {
        console.error("❌ Fetch Sessions Failed:", e.response?.data || e.message);
    }


    console.log("\n✨ Training Session Test Completed!");
    process.exit(0);
}

runTest();
