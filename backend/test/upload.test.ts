import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_URL = "http://localhost:3005/api/auth";
const API_URL = "http://localhost:3005/api/users";

const testEmail = `owner_test_${Date.now()}@example.com`;
const testUser = {
    email: testEmail,
    password: "Password123!",
    name: "Cloud Tester",
    fatherName: "Test Father",
    phone: "+251900000000",
    registrationRole: "owner",
    city: "Addis Ababa",
    area: "Bole"
};

async function runUploadTest() {
    console.log("🚀 Starting Full Gym Verification Test (Authenticated + Gym Creation)...");

    try {
        // 1. Register Owner
        console.log("\n1. Registering Owner...");
        try {
            await axios.post(`${AUTH_URL}/sign-up/email`, testUser);
        } catch (e) {
            console.log("Note: User might already exist, proceeding...");
        }

        // 2. Login
        console.log("\n2. Logging in...");
        const signInRes = await axios.post(`${AUTH_URL}/sign-in/email`, {
            email: testUser.email,
            password: testUser.password
        });
        const token = signInRes.data.token;
        const userId = signInRes.data.user.id;
        console.log(`✅ Login Successful! Token retrieved: ${token?.substring(0, 10)}...`);

        // 3. Create a Gym for this owner (Required for the new flow)
        console.log("\n3. Creating Gym Profile...");
        try {
            await axios.post(`${API_URL.replace('/users', '/gyms')}`, {
                ownerId: userId,
                ownerName: testUser.name,
                ownerEmail: testUser.email,
                city: "Test City",
                area: "Test Area"
            }, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            console.log("✅ Gym Profile Created!");
        } catch (e: any) {
            console.log("Note: Gym might already exist or creation failed:", e.response?.data?.message || e.message);
        }

        // 4. Prepare Image File
        console.log("\n4. Preparing Image File...");
        const testFilePath = path.join(__dirname, "image.png");
        if (!fs.existsSync(testFilePath)) {
            throw new Error(`Test image not found at ${testFilePath}`);
        }

        // 5. Upload File
        console.log("\n5. Uploading image.png as 'document' to Cloudinary...");
        const form = new FormData();
        form.append("document", fs.createReadStream(testFilePath));

        const uploadRes = await axios.post(`${API_URL}/upload-documents`, form, {
            headers: {
                ...form.getHeaders(),
                "Authorization": `Bearer ${token}`
            }
        });

        console.log("✅ Upload Successful!");
        console.log("Response Message:", uploadRes.data.message);
        console.log("Verified Document URL:", uploadRes.data.document);

        if (uploadRes.data.document && uploadRes.data.document.includes("cloudinary.com")) {
            console.log("✨ SUCCESS: Verified Cloudinary URL for single document!");
        } else {
            console.error("❌ FAILURE: Response did not contain a Cloudinary URL.");
        }

        // Cleanup - NO UNLINK for persistent image.png
    } catch (error: any) {
        console.error("\n❌ Test Failed!");
        if (axios.isAxiosError(error)) {
            console.error("Status Code:", error.response?.status);
            console.log("Response Data Preview (first 200 chars):");
            const dataStr = typeof error.response?.data === 'string' 
                ? error.response.data 
                : JSON.stringify(error.response?.data);
            console.log(dataStr?.substring(0, 200));
            
            if (error.response?.status === 500) {
                console.log("\n💡 TIP: A 500 error usually means a Cloudinary config mismatch or a server crash. Check the backend console for the full stack trace.");
            }
        } else {
            console.error("Non-Axios Error:", error.message || error);
        }
    }
}

runUploadTest();
