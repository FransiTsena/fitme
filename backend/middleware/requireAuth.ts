import type { Request, Response, NextFunction } from "express";
import { requireAuth as jwtRequireAuth, optionalAuth as jwtOptionalAuth, requireRole as jwtRequireRole } from "../utils/jwtAuth.js";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role?: string | null;
        emailVerified?: boolean;
        [key: string]: any;
      };
    }
  }
}

// Export the new JWT-based middleware functions
export { jwtRequireAuth as requireAuth, jwtOptionalAuth as optionalAuth, jwtRequireRole as requireRole };
