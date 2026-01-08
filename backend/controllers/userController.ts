import type { Request, Response } from "express";
import { auth } from "../utils/auth.js";
import { db } from "../models/authDb.js";
import { sendEmail } from "../utils/email.js";
import { ObjectId } from "mongodb";

// Extend Request type to include files from multer
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

/**
 * Sign up a new user
 * POST /api/users/signup
 */
export const signupUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, fatherName, registrationRole, city, area } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }

    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        phone,
        fatherName,
        registrationRole,
        city,
        area,
      },
    });

    res.status(201).json({
      message: "User created successfully. Please verify your email.",
      user: result.user,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(400).json({ error: error.message || "Signup failed" });
  }
};

/**
 * Login user and return session token
 * POST /api/users/login
 * 
 * Note: Better-auth uses signed session tokens. The full token format is:
 * <token>.<signature>
 * Clients should use the token returned here with the Authorization header
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Use the internal handler to get proper response with cookies
    const headers = new Headers();
    headers.set("content-type", "application/json");

    const internalReq = new Request(`${process.env.BACKEND_URL || 'http://localhost:3005'}/api/auth/sign-in/email`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, password }),
    });

    const internalRes = await auth.handler(internalReq);
    const data = await internalRes.json();

    if (!data.user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Extract the full signed session token from Set-Cookie header
    let sessionToken = data.token;
    const setCookie = internalRes.headers.get("set-cookie");
    if (setCookie) {
      const match = setCookie.match(/better-auth\.session_token=([^;]+)/);
      if (match) {
        sessionToken = decodeURIComponent(match[1] ?? "");
      }
    }

    res.status(200).json({
      message: "Login successful",
      user: data.user,
      token: sessionToken,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(401).json({ error: error.message || "Invalid credentials" });
  }
};

/**
 * Get current authenticated user
 * GET /api/users/me
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    res.status(200).json({
      user: req.user,
    });
  } catch (error: any) {
    console.error("GetMe error:", error);
    res.status(500).json({ error: "Failed to get user data" });
  }
};

/**
 * Verify OTP (placeholder - implement based on your OTP system)
 * POST /api/users/verify-otp
 */
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // TODO: Implement OTP verification logic
    // This depends on your OTP generation/storage strategy

    res.status(200).json({ message: "OTP verification not implemented" });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    res.status(400).json({ error: error.message || "OTP verification failed" });
  }
};

/**
 * Refresh JWT token
 * POST /api/users/refreshToken
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const token = authHeader.split(" ")[1];

    // Verify current session using cookie format (required by better-auth)
    const session = await auth.api.getSession({
      headers: new Headers({
        cookie: `better-auth.session_token=${encodeURIComponent(token ?? "")}`,
      }),
    });

    if (!session || !session.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Return the same valid token (better-auth session tokens remain valid until expiry)
    res.status(200).json({
      message: "Token refreshed successfully",
      token: token,
      user: session.user,
    });
  } catch (error: any) {
    console.error("Refresh token error:", error);
    res.status(401).json({ error: error.message || "Token refresh failed" });
  }
};

/**
 * Logout user
 * POST /api/users/logout
 */
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      // Revoke the session on the server side
      await auth.api.signOut({
        headers: new Headers({
          authorization: `Bearer ${token}`,
        }),
      });
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Logout error:", error);
    // Still return success as client should clear token anyway
    res.status(200).json({ message: "Logged out successfully" });
  }
};

/**
 * Forgot password - send reset email
 * POST /api/users/forgotPassword
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Use better-auth's forgot password endpoint
    // The actual endpoint is available at /api/auth/forget-password
    // This is a passthrough that can be used or clients can call better-auth directly
    const authApi = auth.api as any;
    if (authApi.forgetPassword) {
      await authApi.forgetPassword({
        body: {
          email,
          redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
        },
      });
    }

    res.status(200).json({
      message: "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    // Don't reveal if email exists or not
    res.status(200).json({
      message: "If an account exists with this email, a reset link has been sent.",
    });
  }
};

/**
 * Reset password with token
 * PUT /api/users/resetPassword/:token
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    await auth.api.resetPassword({
      body: {
        token,
        newPassword,
      },
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(400).json({ error: error.message || "Password reset failed" });
  }
};

/**
 * Update user role (admin only)
 * POST /api/users/updateRole
 */
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { userId, newRole } = req.body;
    const authHeader = req.headers.authorization;

    if (!userId || !newRole) {
      return res.status(400).json({ error: "User ID and new role are required" });
    }

    const allowedRoles = ["member", "owner", "trainer", "admin"];
    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check if current user is admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update roles" });
    }

    await auth.api.setRole({
      headers: new Headers({
        authorization: authHeader || "",
      }),
      body: {
        userId,
        role: newRole,
      },
    });

    res.status(200).json({ message: "Role updated successfully" });
  } catch (error: any) {
    console.error("Update role error:", error);
    res.status(400).json({ error: error.message || "Role update failed" });
  }
};

/**
 * Upload owner documents for verification
 * POST /api/users/upload-documents
 * Requires: JWT auth, role: owner
 */
export const uploadOwnerDocuments = async (req: Request, res: Response) => {
  try {
    /* 
    TEMPORARY BYPASS FOR OPEN ROUTE TESTING
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== "owner") {
      return res.status(403).json({ error: "Only gym owners can upload verification documents" });
    }
    */

    const files = (req as any).files as MulterFile[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No documents uploaded" });
    }

    // Get document URLs - file.path contains the full Cloudinary URL
    const documentUrls = files.map((file: any) => file.path);

    /*
    TEMPORARY BYPASS FOR OPEN ROUTE TESTING
    // Update user's document status in database
    const usersCollection = db.collection("user");
    await usersCollection.updateOne(
      { _id: new ObjectId(req.user.id) },
      {
        $set: {
          ownerDocuments: documentUrls,
          documentStatus: "pending",
          documentSubmittedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
    */

    return res.status(200).json({
      message: "Documents uploaded successfully (Open Route Mode)",
      documents: documentUrls,
    });
  } catch (error: any) {
    console.error("❌ UPLOAD ERROR:", error);
    return res.status(500).json({
      error: "Upload failed",
      message: error.message || "Internal Server Error"
    });
  }
};

/**
 * Get document verification status
 * GET /api/users/document-status
 */
export const getDocumentStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const usersCollection = db.collection("user");
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      documentStatus: user.documentStatus || "not_submitted",
      documents: user.ownerDocuments || [],
      submittedAt: user.documentSubmittedAt,
      reviewedAt: user.documentReviewedAt,
      reviewNotes: user.documentReviewNotes,
    });
  } catch (error: any) {
    console.error("Get document status error:", error);
    res.status(500).json({ error: "Failed to get document status" });
  }
};

/**
 * Get all pending document verifications (admin only)
 * GET /api/users/pending-verifications
 */
export const getPendingVerifications = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const usersCollection = db.collection("user");
    const pendingUsers = await usersCollection
      .find({ documentStatus: "pending" })
      .project({
        _id: 1,
        name: 1,
        email: 1,
        phone: 1,
        city: 1,
        area: 1,
        ownerDocuments: 1,
        documentSubmittedAt: 1,
      })
      .toArray();

    res.status(200).json({
      count: pendingUsers.length,
      users: pendingUsers,
    });
  } catch (error: any) {
    console.error("Get pending verifications error:", error);
    res.status(500).json({ error: "Failed to get pending verifications" });
  }
};

/**
 * Review owner documents (admin only)
 * PUT /api/users/review-documents/:userId
 */
export const reviewOwnerDocuments = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { userId } = req.params;
    const { status, notes } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const validStatuses = ["approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    }

    const usersCollection = db.collection("user");

    // Get user to send email notification
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update document status
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          documentStatus: status,
          documentReviewedAt: new Date(),
          documentReviewedBy: req.user.id,
          documentReviewNotes: notes || "",
          // If approved, also set owner status to active
          ...(status === "approved" && { status: "active" }),
          updatedAt: new Date(),
        },
      }
    );

    // Send email notification to the owner only if SMTP is enabled
    const emailSubject = status === "approved"
      ? "Your Gym Owner Account is Verified! - FitMe"
      : "Document Verification Update - FitMe";

    const emailHtml = status === "approved"
      ? `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Congratulations! 🎉</h2>
          <p>Hi ${user.name},</p>
          <p>Your gym owner documents have been verified and approved. You now have full access to all gym owner features on FitMe.</p>
          <p>You can now:</p>
          <ul>
            <li>Add and manage your gym listings</li>
            <li>Accept member registrations</li>
            <li>Access owner dashboard</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}/owner/dashboard"
             style="display:inline-block;padding:12px 24px;
                    background:#28a745;color:#fff;
                    text-decoration:none;border-radius:5px;
                    font-weight:bold;margin-top:10px;">
            Go to Dashboard
          </a>
        </div>
      `
      : `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Document Review Update</h2>
          <p>Hi ${user.name},</p>
          <p>Unfortunately, we could not verify your documents at this time.</p>
          ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ""}
          <p>Please upload valid documents to complete your verification.</p>
          <a href="${process.env.FRONTEND_URL}/owner/upload-documents"
             style="display:inline-block;padding:12px 24px;
                    background:#007bff;color:#fff;
                    text-decoration:none;border-radius:5px;
                    font-weight:bold;margin-top:10px;">
            Upload New Documents
          </a>
        </div>
      `;

    if (process.env.SMTP_ENABLED !== 'false' && process.env.SMTP_ENABLED !== '0') {
      await sendEmail({
        to: user.email,
        subject: emailSubject,
        html: emailHtml,
      });
    } else {
      console.log(`📧 Document status email would have been sent to ${user.email} (SMTP disabled)`);
    }

    res.status(200).json({
      message: `Documents ${status} successfully`,
      userId,
      status,
    });
  } catch (error: any) {
    console.error("Review documents error:", error);
    res.status(500).json({ error: error.message || "Failed to review documents" });
  }
};

/**
 * Resend document upload link to owner
 * POST /api/users/resend-upload-link
 */
export const resendUploadLink = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== "owner") {
      return res.status(403).json({ error: "Only gym owners can request upload links" });
    }

    const uploadUrl = `${process.env.FRONTEND_URL}/owner/upload-documents`;

    if (process.env.SMTP_ENABLED !== 'false' && process.env.SMTP_ENABLED !== '0') {
      await sendEmail({
        to: req.user.email,
        subject: "Upload Your Verification Documents - FitMe",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Complete Your Gym Owner Verification</h2>
            <p>Hi ${req.user.name},</p>
            <p>To complete your gym owner registration, please upload the following documents:</p>
            <ul>
              <li>Business registration certificate</li>
              <li>Gym ownership proof or lease agreement</li>
              <li>Valid government-issued ID</li>
            </ul>
            <a href="${uploadUrl}"
               style="display:inline-block;padding:12px 24px;
                      background:#007bff;color:#fff;
                      text-decoration:none;border-radius:5px;
                      font-weight:bold;margin-top:10px;">
            Upload Documents
          </a>
          <p style="margin-top:20px;font-size:14px;color:#666;">
            If the button doesn't work, copy and paste this link:
          </p>
          <p style="word-break:break-all;font-size:12px;color:#007bff;">
            ${uploadUrl}
          </p>
        </div>
      `,
      });
    } else {
      console.log(`📧 Upload link email would have been sent to ${req.user.email} (SMTP disabled)`);
    }

    res.status(200).json({ message: "Upload link sent to your email" });
  } catch (error: any) {
    console.error("Resend upload link error:", error);
    res.status(500).json({ error: "Failed to send upload link" });
  }
};

/**
 * Get all unverified gyms (owners with pending documents)
 * GET /api/users/unverified-gyms
 */
export const getUnverifiedGyms = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const usersCollection = db.collection("user");

    // Find all owners with pending document status
    const unverifiedOwners = await usersCollection
      .find({
        role: "owner",
        documentStatus: "pending"
      })
      .project({
        _id: 1,
        name: 1,
        email: 1,
        phone: 1,
        city: 1,
        area: 1,
        ownerDocuments: 1,
        documentSubmittedAt: 1,
        createdAt: 1,
      })
      .sort({ documentSubmittedAt: -1 })
      .toArray();

    res.status(200).json({
      count: unverifiedOwners.length,
      gyms: unverifiedOwners.map(owner => ({
        ownerId: owner._id,
        ownerName: owner.name,
        ownerEmail: owner.email,
        ownerPhone: owner.phone,
        city: owner.city,
        area: owner.area,
        documents: owner.ownerDocuments || [],
        submittedAt: owner.documentSubmittedAt,
        registeredAt: owner.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Get unverified gyms error:", error);
    res.status(500).json({ error: "Failed to get unverified gyms" });
  }
};

/**
 * Validate/approve a gym owner and create gym record
 * POST /api/users/validate-gym/:ownerId
 */
export const validateGym = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { ownerId } = req.params;
    const { gymName, notes } = req.body;

    if (!ownerId) {
      return res.status(400).json({ error: "Owner ID is required" });
    }

    const usersCollection = db.collection("user");
    const gymsCollection = db.collection("gym");

    // Get the owner
    const owner = await usersCollection.findOne({ _id: new ObjectId(ownerId) });

    if (!owner) {
      return res.status(404).json({ error: "Owner not found" });
    }

    if (owner.role !== "owner") {
      return res.status(400).json({ error: "User is not a gym owner" });
    }

    if (owner.documentStatus !== "pending") {
      return res.status(400).json({
        error: `Cannot validate: document status is '${owner.documentStatus}'`
      });
    }

    // Check if gym already exists for this owner
    const existingGym = await gymsCollection.findOne({ ownerId: new ObjectId(ownerId) });
    if (existingGym) {
      return res.status(400).json({ error: "Gym already exists for this owner" });
    }

    // Create the verified gym record
    const gymRecord = {
      ownerId: new ObjectId(ownerId),
      ownerName: owner.name,
      ownerEmail: owner.email,
      ownerPhone: owner.phone,
      gymName: gymName || `${owner.name}'s Gym`,
      city: owner.city,
      area: owner.area,
      verifiedAt: new Date(),
      verifiedBy: req.user.id,
      verificationDocuments: owner.ownerDocuments || [],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await gymsCollection.insertOne(gymRecord);

    // Update the owner's document status to approved
    await usersCollection.updateOne(
      { _id: new ObjectId(ownerId) },
      {
        $set: {
          documentStatus: "approved",
          documentReviewedAt: new Date(),
          documentReviewedBy: req.user.id,
          documentReviewNotes: notes || "Gym verified and approved",
          status: "active",
          updatedAt: new Date(),
        },
      }
    );

    // Send approval email to the owner only if SMTP is enabled
    if (process.env.SMTP_ENABLED !== 'false' && process.env.SMTP_ENABLED !== '0') {
      await sendEmail({
        to: owner.email,
        subject: "Your Gym is Now Verified! 🎉 - FitMe",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Congratulations! Your Gym is Verified!</h2>
            <p>Hi ${owner.name},</p>
            <p>Great news! Your gym ownership documents have been reviewed and approved. Your gym "<strong>${gymRecord.gymName}</strong>" is now officially registered on FitMe.</p>
            <p>You now have full access to:</p>
            <ul>
              <li>Your gym owner dashboard</li>
              <li>Member management tools</li>
              <li>Gym profile customization</li>
              <li>Analytics and reports</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/owner/dashboard"
               style="display:inline-block;padding:12px 24px;
                      background:#28a745;color:#fff;
                      text-decoration:none;border-radius:5px;
                      font-weight:bold;margin-top:10px;">
            Go to Your Dashboard
          </a>
          <p style="margin-top:20px;color:#666;">
            Welcome to the FitMe community of verified gym owners!
          </p>
        </div>
      `,
      });
    } else {
      console.log(`📧 Gym approval email would have been sent to ${owner.email} (SMTP disabled)`);
    }

    res.status(200).json({
      message: "Gym validated and created successfully",
      gym: {
        gymId: result.insertedId,
        gymName: gymRecord.gymName,
        ownerId: ownerId,
        ownerName: owner.name,
        city: gymRecord.city,
        area: gymRecord.area,
        status: gymRecord.status,
        verifiedAt: gymRecord.verifiedAt,
      },
    });
  } catch (error: any) {
    console.error("Validate gym error:", error);
    res.status(500).json({ error: error.message || "Failed to validate gym" });
  }
};

/**
 * Get all verified gyms
 * GET /api/users/verified-gyms
 */
export const getVerifiedGyms = async (req: Request, res: Response) => {
  try {
    const gymsCollection = db.collection("gym");

    // Optional filters from query params
    const { city, area, status } = req.query;

    const filter: any = {};
    if (city) filter.city = city;
    if (area) filter.area = area;
    if (status) filter.status = status;
    else filter.status = "active"; // Default to active gyms only

    const gyms = await gymsCollection
      .find(filter)
      .project({
        _id: 1,
        ownerId: 1,
        ownerName: 1,
        gymName: 1,
        city: 1,
        area: 1,
        address: 1,
        description: 1,
        operatingHours: 1,
        amenities: 1,
        images: 1,
        status: 1,
        verifiedAt: 1,
      })
      .sort({ verifiedAt: -1 })
      .toArray();

    res.status(200).json({
      count: gyms.length,
      gyms: gyms.map(gym => ({
        gymId: gym._id,
        ownerId: gym.ownerId,
        ownerName: gym.ownerName,
        gymName: gym.gymName,
        city: gym.city,
        area: gym.area,
        address: gym.address,
        description: gym.description,
        operatingHours: gym.operatingHours,
        amenities: gym.amenities || [],
        images: gym.images || [],
        status: gym.status,
        verifiedAt: gym.verifiedAt,
      })),
    });
  } catch (error: any) {
    console.error("Get verified gyms error:", error);
    res.status(500).json({ error: "Failed to get verified gyms" });
  }
};
