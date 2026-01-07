import axios, { AxiosError } from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3005";
const AUTH_URL = `${BASE_URL}/api/auth`;
const USERS_URL = `${BASE_URL}/api/users`;

// Generate unique email for each test run
const timestamp = Date.now();
const ownerEmail = `gymowner_${timestamp}@test.com`;
const adminEmail = `admin_${timestamp}@test.com`;

const gymOwnerUser = {
  email: ownerEmail,
  password: "SecurePass123!",
  name: "Test Gym Owner",
  fatherName: "Owner Father",
  phone: "+251911111111",
  registrationRole: "owner",
  city: "Addis Ababa",
  area: "Bole",
};

const adminUser = {
  email: adminEmail,
  password: "AdminPass123!",
  name: "Test Admin",
  registrationRole: "admin",
};

let ownerToken: string = "";
let adminToken: string = "";
let ownerId: string = "";

// Helper function to handle errors
function handleError(error: unknown, testName: string) {
  console.error(`❌ ${testName} Failed!`);
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    if (axiosError.response) {
      console.error("  Status:", axiosError.response.status);
      console.error("  Data:", JSON.stringify(axiosError.response.data, null, 2));
    } else {
      console.error("  Error:", axiosError.message);
    }
  } else if (error instanceof Error) {
    console.error("  Error:", error.message);
  }
  return false;
}

// Test 1: Gym Owner Registration
async function testOwnerSignup(): Promise<boolean> {
  console.log("\n📝 Test 1: Gym Owner Registration");
  console.log("─".repeat(50));

  try {
    const response = await axios.post(`${AUTH_URL}/sign-up/email`, gymOwnerUser);

    console.log("✅ Owner Registration Successful!");
    console.log("  User ID:", response.data.user?.id);
    console.log("  Email:", response.data.user?.email);
    console.log("  Role:", response.data.user?.role);
    console.log("  Document Status:", response.data.user?.documentStatus || "not_submitted");

    ownerId = response.data.user?.id;

    // Verify role is set to "owner"
    if (response.data.user?.role !== "owner") {
      console.error("  ⚠️ Warning: Role should be 'owner', got:", response.data.user?.role);
      return false;
    }

    return true;
  } catch (error) {
    return handleError(error, "Owner Registration");
  }
}

// Test 2: Gym Owner Login
async function testOwnerLogin(): Promise<boolean> {
  console.log("\n🔐 Test 2: Gym Owner Login");
  console.log("─".repeat(50));

  try {
    // Use our custom login endpoint that extracts the full signed session token
    const response = await axios.post(`${USERS_URL}/login`, {
      email: gymOwnerUser.email,
      password: gymOwnerUser.password,
    });

    console.log("✅ Owner Login Successful!");
    
    // Extract token from response
    ownerToken = response.data.token;
    
    if (ownerToken) {
      console.log("  Token received: Yes");
      console.log("  Token length:", ownerToken.length);
      console.log("  Token preview:", ownerToken.substring(0, 50) + "...");
      
      // Decode and display JWT payload
      try {
        const payload = JSON.parse(Buffer.from(ownerToken.split('.')[1], 'base64').toString());
        console.log("\n  JWT Payload:");
        console.log("  ", JSON.stringify(payload, null, 4).replace(/\n/g, '\n  '));
      } catch {
        console.log("  Could not decode JWT payload");
      }
    } else {
      console.log("  ⚠️ No token in response");
    }

    // Verify user data
    const user = response.data.user;
    if (user) {
      console.log("\n  User Details:");
      console.log("    - ID:", user.id);
      console.log("    - Name:", user.name);
      console.log("    - Email:", user.email);
      console.log("    - Role:", user.role);
      console.log("    - Phone:", user.phone);
      console.log("    - City:", user.city);
      console.log("    - Area:", user.area);
      console.log("    - Email Verified:", user.emailVerified);
      console.log("    - Document Status:", user.documentStatus || "not_submitted");
    }

    return !!ownerToken;
  } catch (error) {
    return handleError(error, "Owner Login");
  }
}

// Test 3: Get Owner Profile (Protected Route)
async function testGetOwnerProfile(): Promise<boolean> {
  console.log("\n👤 Test 3: Get Owner Profile (JWT Protected)");
  console.log("─".repeat(50));

  if (!ownerToken) {
    console.log("  ⚠️ Skipped: No token available");
    return false;
  }

  try {
    const response = await axios.get(`${USERS_URL}/me`, {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
      },
    });

    console.log("✅ Profile Retrieved Successfully!");
    console.log("  User:", JSON.stringify(response.data.user, null, 2));

    return true;
  } catch (error) {
    return handleError(error, "Get Owner Profile");
  }
}

// Test 4: Check Document Status (Before Upload)
async function testDocumentStatusBeforeUpload(): Promise<boolean> {
  console.log("\n📄 Test 4: Check Document Status (Before Upload)");
  console.log("─".repeat(50));

  if (!ownerToken) {
    console.log("  ⚠️ Skipped: No token available");
    return false;
  }

  try {
    const response = await axios.get(`${USERS_URL}/document-status`, {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
      },
    });

    console.log("✅ Document Status Retrieved!");
    console.log("  Status:", response.data.documentStatus);
    console.log("  Documents:", response.data.documents?.length || 0);

    // Verify initial status
    if (response.data.documentStatus !== "not_submitted") {
      console.log("  ⚠️ Warning: Expected 'not_submitted', got:", response.data.documentStatus);
    }

    return true;
  } catch (error) {
    return handleError(error, "Check Document Status");
  }
}

// Test 5: Upload Documents (Mock - creates a test file)
async function testDocumentUpload(): Promise<boolean> {
  console.log("\n📤 Test 5: Upload Owner Documents");
  console.log("─".repeat(50));

  if (!ownerToken) {
    console.log("  ⚠️ Skipped: No token available");
    return false;
  }

  try {
    // Create a temporary test file
    const testFilePath = path.join(process.cwd(), "test", "test_document.txt");
    fs.writeFileSync(testFilePath, "This is a test document for gym owner verification.");

    const formData = new FormData();
    formData.append("documents", fs.createReadStream(testFilePath), {
      filename: "business_license.pdf",
      contentType: "application/pdf",
    });

    const response = await axios.post(`${USERS_URL}/upload-documents`, formData, {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        ...formData.getHeaders(),
      },
    });

    console.log("✅ Documents Uploaded Successfully!");
    console.log("  Message:", response.data.message);
    console.log("  Status:", response.data.status);
    console.log("  Documents:", response.data.documents);

    // Cleanup test file
    fs.unlinkSync(testFilePath);

    return response.data.status === "pending";
  } catch (error) {
    return handleError(error, "Document Upload");
  }
}

// Test 6: Check Document Status (After Upload)
async function testDocumentStatusAfterUpload(): Promise<boolean> {
  console.log("\n📄 Test 6: Check Document Status (After Upload)");
  console.log("─".repeat(50));

  if (!ownerToken) {
    console.log("  ⚠️ Skipped: No token available");
    return false;
  }

  try {
    const response = await axios.get(`${USERS_URL}/document-status`, {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
      },
    });

    console.log("✅ Document Status Retrieved!");
    console.log("  Status:", response.data.documentStatus);
    console.log("  Documents:", response.data.documents);
    console.log("  Submitted At:", response.data.submittedAt);

    return response.data.documentStatus === "pending";
  } catch (error) {
    return handleError(error, "Check Document Status After Upload");
  }
}

// Test 7: Resend Upload Link
async function testResendUploadLink(): Promise<boolean> {
  console.log("\n📧 Test 7: Resend Document Upload Link");
  console.log("─".repeat(50));

  if (!ownerToken) {
    console.log("  ⚠️ Skipped: No token available");
    return false;
  }

  try {
    const response = await axios.post(
      `${USERS_URL}/resend-upload-link`,
      {},
      {
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
      }
    );

    console.log("✅ Upload Link Resent!");
    console.log("  Message:", response.data.message);

    return true;
  } catch (error) {
    return handleError(error, "Resend Upload Link");
  }
}

// Test 8: Non-Owner Cannot Upload Documents
async function testNonOwnerCannotUpload(): Promise<boolean> {
  console.log("\n🚫 Test 8: Non-Owner Cannot Upload Documents");
  console.log("─".repeat(50));

  // Create and login as a regular member
  const memberEmail = `member_${timestamp}@test.com`;
  const memberUser = {
    email: memberEmail,
    password: "MemberPass123!",
    name: "Test Member",
    registrationRole: "member",
  };

  try {
    // Register member
    await axios.post(`${AUTH_URL}/sign-up/email`, memberUser);
    
    // Login member using our custom endpoint to get full token
    const loginRes = await axios.post(`${USERS_URL}/login`, {
      email: memberUser.email,
      password: memberUser.password,
    });

    const memberToken = loginRes.data.token;

    if (!memberToken) {
      console.log("  ⚠️ Could not get member token");
      return false;
    }

    // Try to upload documents as member (should fail)
    const formData = new FormData();
    formData.append("documents", Buffer.from("test"), {
      filename: "test.pdf",
      contentType: "application/pdf",
    });

    await axios.post(`${USERS_URL}/upload-documents`, formData, {
      headers: {
        Authorization: `Bearer ${memberToken}`,
        ...formData.getHeaders(),
      },
    });

    // If we get here, the test failed (should have thrown 403)
    console.log("  ❌ Member was able to upload documents (should be forbidden)");
    return false;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      console.log("✅ Non-owner correctly denied access!");
      console.log("  Status: 403 Forbidden");
      console.log("  Message:", error.response.data.error);
      return true;
    }
    return handleError(error, "Non-Owner Upload Test");
  }
}

// Test 9: JWT Token Refresh
async function testTokenRefresh(): Promise<boolean> {
  console.log("\n🔄 Test 9: JWT Token Refresh");
  console.log("─".repeat(50));

  if (!ownerToken) {
    console.log("  ⚠️ Skipped: No token available");
    return false;
  }

  try {
    const response = await axios.post(
      `${USERS_URL}/refreshToken`,
      {},
      {
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
      }
    );

    console.log("✅ Token Refreshed Successfully!");
    console.log("  New Token:", response.data.token ? "Yes" : "No");
    console.log("  User ID:", response.data.user?.id);

    if (response.data.token) {
      ownerToken = response.data.token;
    }

    return !!response.data.token;
  } catch (error) {
    return handleError(error, "Token Refresh");
  }
}

// Test 10: Owner Logout
async function testOwnerLogout(): Promise<boolean> {
  console.log("\n🚪 Test 10: Owner Logout");
  console.log("─".repeat(50));

  if (!ownerToken) {
    console.log("  ⚠️ Skipped: No token available");
    return false;
  }

  try {
    const response = await axios.post(
      `${USERS_URL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
      }
    );

    console.log("✅ Owner Logged Out Successfully!");
    console.log("  Message:", response.data.message);

    return true;
  } catch (error) {
    return handleError(error, "Owner Logout");
  }
}

// Main test runner
async function runGymOwnerTests() {
  console.log("═".repeat(60));
  console.log("🏋️  GYM OWNER SIGNUP & VERIFICATION TESTS");
  console.log("═".repeat(60));
  console.log(`Test Run: ${new Date().toISOString()}`);
  console.log(`Owner Email: ${ownerEmail}`);

  const results: { name: string; passed: boolean }[] = [];

  // Run tests sequentially
  results.push({ name: "Owner Signup", passed: await testOwnerSignup() });
  results.push({ name: "Owner Login", passed: await testOwnerLogin() });
  results.push({ name: "Get Owner Profile", passed: await testGetOwnerProfile() });
  results.push({ name: "Document Status (Before)", passed: await testDocumentStatusBeforeUpload() });
  results.push({ name: "Document Upload", passed: await testDocumentUpload() });
  results.push({ name: "Document Status (After)", passed: await testDocumentStatusAfterUpload() });
  results.push({ name: "Resend Upload Link", passed: await testResendUploadLink() });
  results.push({ name: "Non-Owner Cannot Upload", passed: await testNonOwnerCannotUpload() });
  results.push({ name: "Token Refresh", passed: await testTokenRefresh() });
  results.push({ name: "Owner Logout", passed: await testOwnerLogout() });

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("═".repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  results.forEach((r) => {
    console.log(`  ${r.passed ? "✅" : "❌"} ${r.name}`);
  });

  console.log("─".repeat(60));
  console.log(`  Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log("═".repeat(60));

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runGymOwnerTests().catch((error) => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});
