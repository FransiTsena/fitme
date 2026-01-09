import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/userModel.js';

// Generate JWT token
export const generateToken = (userId: string, role: string): string => {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';
  return jwt.verify(token, JWT_SECRET);
};

// Authentication middleware
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; // Extract token after 'Bearer'

    // Verify token
    const decoded = verifyToken(token);

    // Find user by ID from token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    // Attach user to request
    (req as any).user = user.toObject();
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Optional authentication middleware
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      const user = await User.findById(decoded.userId);
      if (user) {
        (req as any).user = user.toObject();
      }
    }
  } catch (error) {
    // Continue without user if token is invalid
  }
  next();
};

// Role-based authorization middleware
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    const userRole = (req as any).user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};