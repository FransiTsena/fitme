
import axios from "axios";

const BASE_URL = "http://localhost:3005/api";
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function runTest() {
    console.log("🚀 Starting Membership Purchase Test\n");

    let ownerId = "";
    let gymId = "";
    let planId = "";
    let memberId = "";
    
    // 1. SETUP: OWNER, GYM, PLAN
    try {
        console.log("1. Setting up Gym & Plan...");
        
        // Owner
        const ownerRes = await axios.post(`${BASE_URL}/users/signup`, {
            name: "Gym Owner Sub",
            email: `owner_sub_${Date.now()}@test.com`,
            password: "password123",
            role: "owner"
        });
        ownerId = ownerRes.data.user.id;

        // Gym
        const gymRes = await axios.post(`${BASE_URL}/gyms`, {
            ownerId,
            name: "Subscription Gym",
            description: "Testing subs",
            location: { type: "Point", coordinates: [0, 0] },
            address: { city: "Test City", area: "Sub Area", street: "Test St" }
        });
        gymId = gymRes.data.data._id;

        // Plan
        const planRes = await axios.post(`${BASE_URL}/memberships`, {
            gymId,
            ownerId,
            title: "Gold Access",
            description: "Best gym ever",
            durationInDays: 30,
            price: 1500
        });
        planId = planRes.data.plan._id;

        console.log(`✅ Plan Created. ID: ${planId}, Gym: ${gymId}`);
    } catch (e: any) {
        console.error("❌ Setup Failed:", e.response?.data || e.message);
        return;
    }

    await delay(500);

    // 2. CREATE MEMBER
    try {
        console.log("\n2. Creating Member...");
        const memberRes = await axios.post(`${BASE_URL}/users/signup`, {
            name: "Sub Member",
            email: `member_sub_${Date.now()}@test.com`,
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

    // 3. PURCHASE MEMBERSHIP
    try {
        console.log("\n3. Purchasing Membership...");
        const res = await axios.post(`${BASE_URL}/subscriptions/purchase`, {
            userId: memberId, // Dev/Test explicit ID
            planId
        });
        console.log(`✅ Purchase Successful!`);
        console.log(`   Start: ${res.data.data.membership.startDate}`);
        console.log(`   End:   ${res.data.data.membership.endDate}`);
        console.log(`   Status: ${res.data.data.membership.status}`);
    } catch (e: any) {
        console.error("❌ Purchase Failed:", e.response?.data || e.message);
        return;
    }

    await delay(500);

    // 4. VERIFY "ONE ACTIVE" RULE
    try {
        console.log("\n4. Attempting Duplicate Purchase (Should Fail)...");
        await axios.post(`${BASE_URL}/subscriptions/purchase`, {
            userId: memberId,
            planId
        });
        console.error("❌ Failed: Duplicate purchase was ALLOWED (Should have been rejected).");
    } catch (e: any) {
        if (e.response && e.response.status === 400 && e.response.data.error.includes("already have an active membership")) {
            console.log("✅ Success: Duplicate purchase rejected as expected.");
        } else {
            console.error("❌ Failed: Error was not validation error.", e.response?.data || e.message);
        }
    }

    await delay(500);

    // 5. GET MY MEMBERSHIPS
    try {
        console.log("\n5. Fetching My Memberships...");
        const res = await axios.get(`${BASE_URL}/subscriptions/my?userId=${memberId}`);
        const found = res.data.memberships.some((m: any) => m.status === "active" && m.planId.title === "Gold Access");
        if (found) {
            console.log(`✅ Active 'Gold Access' membership found in list.`);
        } else {
            console.error("❌ Membership NOT found in list.");
        }
    } catch (e: any) {
        console.error("❌ Fetch Failed:", e.response?.data || e.message);
    }

    console.log("\n✨ Membership Purchase Test Completed!");
    process.exit(0);
}

runTest();
