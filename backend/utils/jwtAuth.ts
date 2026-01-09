import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
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

        const tokenParts = authHeader.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return res.status(401).json({ error: 'Invalid token format.' });
        }
        const token = tokenParts[1];

        // Verify token
        if (!token) {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }

        // Find user by ID from token
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token. User not found.' });
        }

        // Attach user to request (normalize _id to id)
        const userObj = user.toObject();
        (req as any).user = {
            ...userObj,
            id: userObj._id.toString(),
        };
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
            const tokenParts = authHeader.split(' ');
            if (tokenParts.length === 2 && tokenParts[0] === 'Bearer') {
                const token = tokenParts[1];
                if (token) {
                    let decoded;
                    try {
                        decoded = verifyToken(token);
                    } catch (error) {
                        // Invalid token, continue without user
                    }

                    if (decoded && decoded.userId) {
                        const user = await User.findById(decoded.userId);
                        if (user) {
                            const userObj = user.toObject();
                            (req as any).user = {
                                ...userObj,
                                id: userObj._id.toString(),
                            };
                        }
                    }
                }
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