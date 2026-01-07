import axios from "axios";

const timestamp = Date.now();
const testUser = {
    email: `test_simple_${timestamp}@gmail.com`,
    password: "Password123!",
    name: "Simple Test",
    fatherName: "Test",
    phone: "1234567890",
    registrationRole: "owner"
};

async function ping() {
    try {
        console.log(`🚀 Pinging registration for: ${testUser.email}`);
        const res = await axios.post("http://localhost:3005/api/auth/sign-up/email", testUser);
        console.log("✅ Server Response:", res.data);
    } catch (error: any) {
        console.error("❌ Registration Failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }
    }
}

ping();
