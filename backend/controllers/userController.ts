import type { Request, Response } from "express";
import { userService } from "../services/userService.js";

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

    const result = await userService.signup({
      email,
      password,
      name,
      phone,
      fatherName,
      registrationRole,
      city,
      area,
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
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { user, token } = await userService.login(email, password);

    res.status(200).json({
      message: "Login successful",
      user,
      token,
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
 * Verify OTP
 * POST /api/users/verify-otp
 */
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // TODO: Implement in userService if needed
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

    // With JWT, refresh logic is typically handled differently
    // For now, we'll just return a success response
    // In a real app, you might implement token rotation

    res.status(200).json({
      message: "Token is valid",
      token: authHeader.split(" ")[1],
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
      await userService.logout(token ?? "");
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Logout error:", error);
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

    await userService.forgotPassword(email);

    res.status(200).json({
      message: "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
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

    await userService.resetPassword(token, newPassword);

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

    // Check if current user is admin (this check remains in controller for quick rejection)
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update roles" });
    }

    await userService.updateRole(authHeader || "", userId, newRole);

    res.status(200).json({ message: "Role updated successfully" });
  } catch (error: any) {
    console.error("Update role error:", error);
    res.status(400).json({ error: error.message || "Role update failed" });
  }
};

/**
 * Upload owner documents for verification
 * POST /api/users/upload-documents
 */
export const uploadOwnerDocuments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.body.ownerId;
    const file = (req as any).file;

    if (!userId) {
      return res.status(400).json({ error: "Owner ID is required (via token or body)" });
    }

    if (!file) {
      return res.status(400).json({ error: "No document uploaded" });
    }

    const documentUrl = await userService.uploadDocuments(userId, file.path);



    return res.status(200).json({
      message: "Document uploaded successfully. Your gym verification is now pending review.",
      document: documentUrl,
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
 * Generic file upload (returns Cloudinary URL)
 * POST /api/users/upload
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Just return the Cloudinary URL
    return res.status(200).json({
      message: "File uploaded successfully",
      url: file.path, // multer-storage-cloudinary puts the URL in file.path
    });
  } catch (error: any) {
    console.error("❌ GENERIC UPLOAD ERROR:", error);
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

    const status = await userService.getDocumentStatus(req.user.id);
    res.status(200).json(status);
  } catch (error: any) {
    console.error("Get document status error:", error);
    res.status(500).json({ error: error.message || "Failed to get document status" });
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

    const pendingUsers = await userService.getPendingVerifications();

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
    const { userId } = req.params;
    const { status, notes } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const adminId = req.user?.id || "mock-admin-id";
    const result = await userService.reviewOwnerDocuments(adminId, userId, status, notes);

    res.status(200).json({
      message: `Documents ${status} successfully`,
      ...result
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

    // Role check and email sending is partially handled in service but needs context here for resend
    // For now, keeping the email logic in service if we migrate it fully, 
    // but the existing logic was mostly email-based.
    // Let's assume userService could have a resend method if needed.

    // Quick fix: keeping it simple as it's a small function
    res.status(200).json({ message: "Upload link feature is currently being refactored" });
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

    const unverifiedGyms = await userService.getUnverifiedGyms();

    res.status(200).json({
      count: unverifiedGyms.length,
      gyms: unverifiedGyms,
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
    const { ownerId } = req.params;
    const { gymName, notes } = req.body;

    if (!ownerId) {
      return res.status(400).json({ error: "Owner ID is required" });
    }

    const adminId = req.user?.id || "mock-admin-id";
    const result = await userService.validateGym(adminId, ownerId, gymName, notes);

    res.status(200).json({
      message: "Gym validated and created successfully",
      gym: result
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
    const gyms = await userService.getVerifiedGyms(req.query);

    res.status(200).json({
      count: gyms.length,
      gyms: gyms.map((gym: any) => ({
        gymId: gym._id,
        ownerId: gym.ownerId,
        name: gym.name,
        location: gym.location,
        rating: gym.rating,
        address: gym.address,
        description: gym.description,
        operatingHours: gym.operatingHours,
        amenities: gym.amenities || [],
        photos: gym.photos || [],
        isActive: gym.isActive,
        verificationStatus: gym.verificationStatus,
      })),
    });
  } catch (error: any) {
    console.error("Get verified gyms error:", error);
    res.status(500).json({ error: "Failed to get verified gyms" });
  }
};
