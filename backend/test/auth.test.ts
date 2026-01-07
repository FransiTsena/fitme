import axios from "axios";

const BASE_URL = "http://localhost:3005/api/auth";

const testEmail = `kaleb@hotmail.com`;
const testUser = {
    email: testEmail,
    password: "Password123!",
    name: "Kaleab Mulugeta",
    fatherName: "Mulugeta",
    phone: "+251912345670",
    registrationRole: "owner",
    status: "active",
    city: "Addis Ababa",
    area: "Bole"
};

async function runTests() {
    console.log("🚀 Starting Authentication Tests...");

    try {
        // 1. Test Registration
        console.log("\n1. Testing Registration...");
        const signUpRes = await axios.post(`${BASE_URL}/sign-up/email`, testUser);
        console.log("✅ Registration Successful!");
        console.log("Response:", signUpRes.data);

        // 2. Test Login
        console.log("\n2. Testing Login...");
        const signInRes = await axios.post(`${BASE_URL}/sign-in/email`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log("✅ Login Successful!");
        console.log("Session/User:", signInRes.data);

        if (signInRes.data.user) {
            console.log("\nVerify Custom Fields in Session:");
            const user = signInRes.data.user;
            console.log(`- Role: ${user.role}`);
            console.log(`- Father Name: ${user.fatherName}`);
            console.log(`- Phone: ${user.phone}`);
            console.log(`- Profile Image: ${user.profileImage || "None"}`);
            console.log(`- City: ${user.city}`);
        }

        // 3. Test Logout
        console.log("\n3. Testing Logout...");
        const signOutRes = await axios.post(`${BASE_URL}/sign-out`, {}, {
            headers: {
                // Better Auth might need the session token if not using cookies
                // But in a simple test like this, it might just clear the server-side session
            }
        });
        console.log("✅ Logout Successful!");

    } catch (error) {
        console.error("❌ Test Failed!");
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Data:", error.response.data);
            } else {
                console.error("Error:", error.message);
            }
        } else if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Unexpected Error:", error);
        }
    }
}

runTests();
