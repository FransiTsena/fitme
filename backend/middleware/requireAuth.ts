import type { Request, Response, NextFunction } from "express";
import { auth } from "../utils/auth.js";

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

/**
 * Session Authentication Middleware
 * Validates the session token from Authorization header and attaches user to request
 * Better-auth uses signed session tokens in format: <token>.<signature>
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Try standard better-auth session retrieval via headers
    let session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    });

    // 2. Fallback: If no session but Authorization header exists, try manually passing as cookie
    // This handles cases where better-auth expects the session token in a specific cookie
    if (!session && req.headers.authorization?.startsWith("Bearer ")) {
      const token = req.headers.authorization.split(" ")[1];
      session = await auth.api.getSession({
        headers: new Headers({
          cookie: `better-auth.session_token=${encodeURIComponent(token ?? "")}`,
        }),
      });
    }

    if (!session || !session.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Attach user to request
    req.user = session.user as any;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Request is not authorized" });
  }
};

/**
 * Optional Auth Middleware
 * Attaches user to request if valid token exists, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    });

    if (session?.user) {
      req.user = session.user as any;
    }

    next();
  } catch (error) {
    // Continue without user if session is invalid
    next();
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if the authenticated user has one of the required roles
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authorization required" });
    }

    if (!roles.includes(req.user.role || "")) {
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }

    next();
  };
};
