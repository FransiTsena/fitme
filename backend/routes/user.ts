import express from "express";
import {
  loginUser,
  signupUser,
  verifyOtp,
  refreshToken,
  logoutUser,
  getMe,
  forgotPassword,
  resetPassword,
  updateRole,
  uploadOwnerDocuments,
  getDocumentStatus,
  getPendingVerifications,
  reviewOwnerDocuments,
  resendUploadLink,
  getUnverifiedGyms,
  validateGym,
  getVerifiedGyms,
} from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import { documentUpload } from "../config/multer.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", loginUser);
router.post("/signup", signupUser);
router.post("/verify-otp", verifyOtp);
router.post("/forgotPassword", forgotPassword);
router.put("/resetPassword/:token", resetPassword);

// Protected routes (JWT authentication required)
router.get("/me", requireAuth, getMe);
router.post("/refreshToken", requireAuth, refreshToken);
router.post("/logout", requireAuth, logoutUser);

// Owner document verification routes
router.post("/upload-documents", requireAuth, documentUpload.array("documents", 5), uploadOwnerDocuments);
router.get("/document-status", requireAuth, getDocumentStatus);
router.post("/resend-upload-link", requireAuth, resendUploadLink);

// Admin-only routes
router.post("/updateRole", requireAuth, requireRole("admin"), updateRole);
router.get("/pending-verifications", requireAuth, requireRole("admin"), getPendingVerifications);
router.put("/review-documents/:userId", requireAuth, requireRole("admin"), reviewOwnerDocuments);

// Gym management routes
router.get("/unverified-gyms", requireAuth, requireRole("admin"), getUnverifiedGyms);
router.post("/validate-gym/:ownerId", requireAuth, requireRole("admin"), validateGym);
router.get("/verified-gyms", getVerifiedGyms); // Public endpoint - anyone can see verified gyms

export default router;
