
import axios from "axios";
import { TrainerPromotion } from "../models/trainerModel.js"; // Direct DB access to get token for test
import mongoose from "mongoose";

const BASE_URL = "http://localhost:3005/api";
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to connect DB for test (to grab token)
async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fitme");
    }
}

async function runTest() {
    console.log("🚀 Starting Trainer Promotion Test\n");

    let ownerId = "";
    let gymId = "";
    let memberId = "";
    const memberEmail = "liyategared85@gmail.com"; // Real email for testing

    // 1. SIGNUP OWNER
    try {
        console.log("1. Registering Owner...");
        const res = await axios.post(`${BASE_URL}/users/signup`, {
            name: "Gym Owner",
            email: `owner_${Date.now()}@test.com`,
            password: "password123",
            role: "owner"
        });
        ownerId = res.data.user.id;
        console.log(`✅ Owner Created! ID: ${ownerId}`);
    } catch (e: any) {
        console.error("❌ Owner Signup Failed:", e.response?.data || e.message);
        return;
    }

    await delay(500);

    // 2. CREATE GYM
    try {
        console.log("\n2. Creating Gym...");
        const res = await axios.post(`${BASE_URL}/gyms`, {
            ownerId,
            name: "Trainer Test Gym",
            description: "Testing trainers",
            location: { type: "Point", coordinates: [0, 0] },
            address: { city: "Test City", area: "Test Area", street: "Test St" }
        });
        gymId = res.data.data._id;
        console.log(`✅ Gym Created! ID: ${gymId}`);
    } catch (e: any) {
        console.error("❌ Gym Creation Failed:", e.response?.data || e.message);
        return;
    }

    await delay(500);

    // 3. CREATE CANDIDATE (MEMBER) OR FETCH EXISTING
    try {
        console.log("\n3. Creating/Fetching Member Candidate...");
        // Try to signup first
        try {
            const res = await axios.post(`${BASE_URL}/users/signup`, {
                name: "Liya Tegared",
                email: memberEmail,
                password: "password123",
                role: "member"
            });
            memberId = res.data.user.id;
            console.log(`✅ Member Created! ID: ${memberId}`);
        } catch (signupError: any) {
            // If user exists, we need to find them. 
            // Since we don't have a direct "get user by email" public endpoint, 
            // for value testing we'll search via the trainer search (which finds members).
            // BUT if they are already a trainer, search won't find them.
            // So we use a direct DB lookup helper for this test script.
            
            await connectDB();
            const existingUser = await mongoose.connection.collection("user").findOne({ email: memberEmail });
            
            if (existingUser) {
                memberId = existingUser._id.toString();
                console.log(`⚠️ User already exists. ID: ${memberId}`);
                
                // FORCE RESET ROLE TO MEMBER for test purposes
                await mongoose.connection.collection("user").updateOne(
                    { _id: existingUser._id },
                    { $set: { role: "member" } }
                );
                console.log("   Role reset to 'member' for testing.");

                // CLEANUP OLD PROMOTIONS
                await mongoose.connection.collection("trainer_promotions").deleteMany({ memberId: existingUser._id });
                 console.log("   Old promotions cleared.");

            } else {
                throw new Error("Could not create or find user.");
            }
        }
    } catch (e: any) {
        console.error("❌ Member Find/Create Failed:", e.response?.data || e.message);
        return;
    }

    await delay(500);

    // 4. SEARCH FOR CANDIDATE
    try {
        console.log("\n4. Searching for Candidate...");
        const res = await axios.get(`${BASE_URL}/trainers/search?q=${memberEmail}`);
        const found = res.data.candidates.some((c: any) => c.email === memberEmail);
        if (found) {
            console.log(`✅ Candidate found in search results.`);
        } else {
            console.error("❌ Candidate NOT found in search results.");
        }
    } catch (e: any) {
        console.error("❌ Search Failed:", e.response?.data || e.message);
    }

    await delay(500);

    // 5. INVITE CANDIDATE
    try {
        console.log("\n5. Inviting Candidate...");
        await axios.post(`${BASE_URL}/trainers/invite`, {
            gymId,
            memberId,
            ownerId // Dev bypass
        });
        console.log(`✅ Invitation Sent! (Email mocked)`);
    } catch (e: any) {
        console.error("❌ Invitation Failed:", e.response?.data || e.message);
        return;
    }

    await delay(1000);

    // 6. RETRIEVE TOKEN (Simulating clicking email link)
    // We need to query DB directly for the token since email is mocked/logged
    let token = "";
    try {
        await connectDB();
        const promo = await TrainerPromotion.findOne({ memberId, status: "pending" }).sort({ createdAt: -1 });
        if (promo) {
            token = promo.token;
            console.log(`✅ Retrieved Token from DB: ${token.substring(0, 10)}...`);
        } else {
            console.error("❌ Could not find promotion record in DB.");
            return;
        }
    } catch (e: any) {
         console.error("❌ DB Query Failed:", e.message);
         return;
    }

    // 7. ACCEPT INVITATION
    try {
        console.log("\n7. Accepting Invitation...");
        const res = await axios.post(`${BASE_URL}/trainers/accept-invite`, { token });
        console.log(`✅ Invitation Accepted! Message: ${res.data.message}`);
    } catch (e: any) {
        console.error("❌ Accept Failed:", e.response?.data || e.message);
    }

    console.log("\n✨ Trainer Promotion Test Completed!");
    process.exit(0);
}

runTest();
