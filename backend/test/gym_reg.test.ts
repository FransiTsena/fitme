import axios from "axios";

const BASE_URL = "http://127.0.0.1:3005/api";
const timestamp = Date.now();
const ownerEmail = `gym_test_${timestamp}@example.com`;
const password = "testpass123";

// Configure axios with a very long timeout for debugging
axios.defaults.timeout = 30000;

async function runTest() {
    console.log("🚀 Starting Isolated Gym Registration Test");
    console.log("------------------------------------------");

    let ownerId = "";

    // 1. SIGNUP
    try {
        console.log("Step 1: Registering Owner...");
        const res = await axios.post(`${BASE_URL}/users/signup`, {
            email: ownerEmail,
            password,
            name: "Gym Test Owner",
            registrationRole: "owner",
            city: "Addis Ababa",
            area: "Bole"
        });
        ownerId = res.data.user.id;
        console.log(`✅ Owner Created! ID: ${ownerId}`);
    } catch (e: any) {
        console.error("❌ Signup Failed:", e.message);
        if (e.response) console.error("Response:", e.response.data);
        process.exit(1);
    }

    // 2. GYM REGISTRATION
    try {
        console.log("\nStep 2: Registering Gym...");
        console.log("Sending data to POST /api/gyms...");
        const res = await axios.post(`${BASE_URL}/gyms`, {
            ownerId,
            name: "Isolated Test Gym",
            description: "Testing if registration works in isolation",
            location: {
                type: "Point",
                coordinates: [38.75, 8.98] // Addis Ababa
            },
            address: {
                city: "Addis Ababa",
                area: "Bole",
                street: "Test St"
            },
            photos: ["https://example.com/photo.jpg"]
        });
        
        console.log("✅ Gym Registration Successful!");
        console.log("Gym ID:", res.data.data._id);
        console.log("Status:", res.data.data.verificationStatus);
    } catch (e: any) {
        console.error("\n❌ Gym Registration Failed!");
        if (e.code === 'ECONNABORTED') {
            console.error("Error: REQUEST TIMED OUT. The server might be hanging or taking too long to process the registration.");
        } else if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", JSON.stringify(e.response.data, null, 2));
        } else {
            console.error("Error:", e.message);
        }
    }

    console.log("\n------------------------------------------");
    console.log("Test Completed.");
}

runTest();
