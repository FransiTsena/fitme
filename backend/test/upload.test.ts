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
    console.log("🚀 Starting Open Cloudinary Upload Test (Unauthenticated)...");

    try {
        // 1. Prepare File
        console.log("\n1. Preparing Image File...");
        const testFilePath = path.join(__dirname, "image.png");
        
        if (!fs.existsSync(testFilePath)) {
            throw new Error(`Test image not found at ${testFilePath}`);
        }

        // 2. Upload File
        console.log("\n2. Uploading image.png to Cloudinary (Open Route)...");
        const form = new FormData();
        form.append("documents", fs.createReadStream(testFilePath));

        const uploadRes = await axios.post(`${API_URL}/upload-documents`, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log("✅ Upload Successful!");
        console.log("Response Message:", uploadRes.data.message);
        console.log("Cloudinary URLs:", uploadRes.data.documents);

        if (uploadRes.data.documents && uploadRes.data.documents[0].includes("cloudinary.com")) {
            console.log("✨ SUCCESS: Verified Cloudinary URL for image!");
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
