import axios from "axios";

const BASE_URL = "http://localhost:3005";

async function debugAuth() {
  console.log("🔍 Debugging Better Auth Session Handling\n");
  
  // Use existing test user or create one
  const testEmail = `debug_${Date.now()}@test.com`;
  const testPassword = "TestPass123!";
  
  try {
    // 1. Sign up
    console.log("1. Creating test user...");
    let userId;
    try {
      const signUpRes = await axios.post(`${BASE_URL}/api/auth/sign-up/email`, {
        email: testEmail,
        password: testPassword,
        name: "Debug User",
        registrationRole: "owner"
      });
      userId = signUpRes.data.user?.id;
      console.log("   User created:", userId);
    } catch (e: any) {
      console.log("   Signup error:", e.response?.data || e.message);
    }
    
    // 2. Sign in
    console.log("\n2. Signing in...");
    const signInRes = await axios.post(`${BASE_URL}/api/auth/sign-in/email`, {
      email: testEmail,
      password: testPassword
    });
    
    console.log("   Response keys:", Object.keys(signInRes.data));
    console.log("   Token from body:", signInRes.data.token?.substring(0, 30) + "...");
    
    // Extract full session token from Set-Cookie header
    const setCookieHeader = signInRes.headers["set-cookie"];
    let fullSessionToken = "";
    if (setCookieHeader) {
      for (const cookie of setCookieHeader) {
        if (cookie.startsWith("better-auth.session_token=")) {
          const match = cookie.match(/better-auth\.session_token=([^;]+)/);
          if (match) {
            fullSessionToken = decodeURIComponent(match[1]);
          }
        }
      }
    }
    
    console.log("   Full token from cookie:", fullSessionToken.substring(0, 50) + "...");
    console.log("   Full token length:", fullSessionToken.length);
    
    // 3. Try with full cookie token
    console.log("\n3. Testing with FULL cookie token...");
    
    console.log("   A) Cookie header with full token:");
    try {
      const resB = await axios.get(`${BASE_URL}/api/auth/get-session`, {
        headers: { Cookie: `better-auth.session_token=${encodeURIComponent(fullSessionToken)}` }
      });
      console.log("      ✅ Works! User:", resB.data.user?.email || resB.data);
    } catch (e: any) {
      console.log("      ❌ Failed:", e.response?.status, e.response?.data);
    }
    
    // 4. Try our custom endpoint with full token
    console.log("\n4. Testing our /api/users/me with full token...");
    
    console.log("   A) With Cookie header:");
    try {
      const resMeCookie = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Cookie: `better-auth.session_token=${encodeURIComponent(fullSessionToken)}` }
      });
      console.log("      ✅ Works! User:", resMeCookie.data.user?.email);
    } catch (e: any) {
      console.log("      ❌ Failed:", e.response?.status, e.response?.data);
    }
    
    console.log("\n   B) With Authorization header (full token):");
    try {
      const resMe = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${fullSessionToken}` }
      });
      console.log("      ✅ Works! User:", resMe.data.user?.email);
    } catch (e: any) {
      console.log("      ❌ Failed:", e.response?.status, e.response?.data);
    }
    
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

debugAuth();
