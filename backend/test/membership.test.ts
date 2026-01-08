
import axios from "axios";
import fs from "fs";

const BASE_URL = "http://localhost:3005/api";
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function runTest() {
    console.log("🚀 Starting Gym Membership Plan Test\n");

    let ownerId = "";
    let gymId = "";
    let planId = "";

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
        console.error("❌ Signup Failed:", e.response?.data || e.message);
        return;
    }

    await delay(500);

    // 2. CREATE GYM
    try {
        console.log("\n2. Creating Gym...");
        const res = await axios.post(`${BASE_URL}/gyms`, {
            ownerId,
            name: "Membership Test Gym",
            description: "Testing plans",
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

    // 3. CREATE MEMBERSHIP PLAN
    try {
        console.log("\n3. Creating Membership Plan...");
        const planData = {
            ownerId,
            gymId,
            title: "Gold Monthly",
            description: "Access to everything",
            durationInDays: 30,
            price: 1500
        };

        const res = await axios.post(`${BASE_URL}/memberships`, planData);
        planId = res.data.plan._id;
        console.log(`✅ Plan Created! ID: ${planId}`);
        console.log(`   Title: ${res.data.plan.title}, Price: ${res.data.plan.price}`);
    } catch (e: any) {
        console.error("❌ Create Plan Failed:", e.response?.data || e.message);
        return; // Stop if creation fails
    }

    await delay(500);

    // 4. UPDATE MEMBERSHIP PLAN
    try {
        console.log("\n4. Updating Membership Plan...");
        const updateData = {
            ownerId, // Ownership check needs this for dev mode
            price: 2000,
            title: "Gold Monthly (Updated)"
        };

        const res = await axios.put(`${BASE_URL}/memberships/${planId}`, updateData);
        console.log(`✅ Plan Updated!`);
        console.log(`   New Title: ${res.data.plan.title}, New Price: ${res.data.plan.price}`);
    } catch (e: any) {
        console.error("❌ Update Plan Failed:", e.response?.data || e.message);
    }

    await delay(500);

    // 5. TOGGLE STATUS (DISABLE)
    try {
        console.log("\n5. Disabling Plan...");
        const res = await axios.patch(`${BASE_URL}/memberships/${planId}/status`, {
            ownerId, // Ownership check needs this
            isActive: false
        });
        console.log(`✅ Plan Disabled! Current isActive: ${res.data.plan.isActive}`);
    } catch (e: any) {
        console.error("❌ Disable Plan Failed:", e.response?.data || e.message);
    }

    await delay(500);

    // 6. VERIFY FETCH (Should be empty or hidden if filtered by active)
    try {
        console.log("\n6. Fetching Gym Plans (Public View)...");
        const res = await axios.get(`${BASE_URL}/memberships/gym/${gymId}`);
        console.log(`✅ Fetched ${res.data.plans.length} plans`);
        // Assuming public view filters by isActive=true
        if (res.data.plans.length === 0) {
           console.log("   Success: Disabled plan is verified hidden from public view.");
        } else {
           console.log("   Result: Plan is still visible (isActive filtered?)");
        }
    } catch (e: any) {
        console.error("❌ Get Plans Failed:", e.response?.data || e.message);
    }

    console.log("\n✨ Membership Flow Test Completed!");
}

runTest();
