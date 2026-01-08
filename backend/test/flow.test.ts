import axios, { AxiosError } from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

const BASE_URL = "http://127.0.0.1:3005/api";
const timestamp = Date.now();
const ownerEmail = `tester_owner_${timestamp}@example.com`;
const password = "testpass123";

let ownerToken: string = "";
let ownerId: string = "";
let gymId: string = "";

// Configure axios with a longer timeout
axios.defaults.timeout = 15000;


// Helper to handle errors
function handleError(error: unknown, step: string) {
    console.error(`\n❌ Step Failed: ${step}`);
    if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
            console.error("Error: Connection timeout. Is the server running on port 3005?");
        } else if (error.code === 'ECONNREFUSED') {
            console.error("Error: Connection refused. Server not found on port 3005.");
        } else {
            console.error("Status:", error.response?.status);
            console.error("Data:", JSON.stringify(error.response?.data, null, 2));
        }
    } else {
        console.error("Error:", error);
    }
    process.exit(1);
}


// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
    console.log("🚀 Starting Dynamic Owner & Gym Registration Test");
    console.log("-------------------------------------------------");

    const imagePath = path.join(process.cwd(), "test", "image.png");
    if (!fs.existsSync(imagePath)) {
        console.error(`❌ Missing test image at: ${imagePath}`);
        process.exit(1);
    }

    // 1. SIGNUP
    try {
        console.log("\n1. Registering as Owner...");
        const res = await axios.post(`${BASE_URL}/users/signup`, {
            email: ownerEmail,
            password,
            name: "Tester Owner",
            registrationRole: "owner",
            city: "Addis Ababa",
            area: "Bole"
        });
        ownerId = res.data.user.id;
        console.log(`✅ Signup Successful! User ID: ${ownerId}`);
    } catch (e) { handleError(e, "Signup"); }

    // 2. REGISTER GYM (Initial)
    try {
        console.log("\n2. Registering Gym (Initial)...");
        const res = await axios.post(`${BASE_URL}/gyms`, {
            ownerId,
            name: "Tester's Dynamic Gym",
            description: "A gym registered with dynamic uploads",
            location: {
                type: "Point",
                coordinates: [38.7578, 8.9806]
            },
            address: {
                city: "Addis Ababa",
                area: "Bole",
                street: "Dynamic Road"
            },
            photos: [] // No photos yet
        });

        gymId = res.data.data._id;
        console.log(`✅ Gym Registered! ID: ${gymId}, Status: ${res.data.data.verificationStatus}`);
    } catch (e) { handleError(e, "Gym Registration (Initial)"); }

    await delay(1000);

    // 3. UPLOAD GYM PHOTOS & UPDATE GYM
    const gymPhotoUrls: string[] = [];
    try {
        console.log("\n3. Uploading Gym Photos (2 files)...");
        for (let i = 1; i <= 2; i++) {
            const formData = new FormData();
            // Explicitly set filename and contentType for streams
            formData.append("file", fs.createReadStream(imagePath), {
                filename: "image.png",
                contentType: "image/png"
            });

            const res = await axios.post(`${BASE_URL}/users/upload`, formData, {
                headers: { ...formData.getHeaders() }
            });
            gymPhotoUrls.push(res.data.url);
            console.log(`✅ Gym Photo ${i} Uploaded! URL: ${res.data.url}`);
            await delay(500);
        }

        console.log("Updating Gym with photo URLs...");
        await axios.put(`${BASE_URL}/gyms/${gymId}`, {
            photos: gymPhotoUrls
        });
        console.log("✅ Gym Photos Updated!");
    } catch (e) { handleError(e, "Gym Photo Upload/Update"); }

    await delay(1000);

    // 4. UPLOAD VERIFICATION DOCUMENT
    let verificationDocUrl = "";
    try {
        console.log("\n4. Uploading Verification Document...");
        const formData = new FormData();
        formData.append("document", fs.createReadStream(imagePath), {
            filename: "verification.png",
            contentType: "image/png"
        });
        formData.append("ownerId", ownerId);

        const res = await axios.post(`${BASE_URL}/users/upload-documents`, formData, {
            headers: { ...formData.getHeaders() }
        });
        verificationDocUrl = res.data.document;
        console.log(`✅ Verification Doc Uploaded! URL: ${verificationDocUrl}`);
    } catch (e) { handleError(e, "Verification Doc Upload"); }


    console.log("\n✨ Full Dynamic Flow Test Completed Successfully!");
}

runTest();

