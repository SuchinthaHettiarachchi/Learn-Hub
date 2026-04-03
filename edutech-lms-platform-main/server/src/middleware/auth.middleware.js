/**
 * Authentication & Authorization Middleware
 * 
 * Two middleware functions for securing API routes:
 *   1. protectRoute — Verifies JWT token from httpOnly cookie
 *   2. adminRoute  — Checks if authenticated user is the admin
 * 
 * Usage in routes:
 *   - protectRoute only:           Any logged-in user can access
 *   - protectRoute + adminRoute:   Only the admin user can access
 */

import jwt from 'jsonwebtoken'
import { ENV } from '../config/env.js'
import { User } from '../models/user.model.js'


/**
 * protectRoute - Authentication middleware
 * 
 * Extracts JWT from the "token" cookie, verifies it, and attaches
 * the full user document (minus password) to req.user.
 * Returns 401 if token is missing, invalid, or expired.
 */
export const protectRoute = async (req, res, next) => {
    try {
        // Extract JWT from httpOnly cookie (set during login/register)
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required - No token provided"
            });
        }

        // Verify token signature and expiration
        let decode;
        try {
            decode = jwt.verify(token, ENV.JWT_SECRET);
            if (!decode || !decode.userId) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token payload"
                });
            }     
        } catch (jwtError) {
            console.log("Authentication failed: ", jwtError);
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
                error: jwtError.message
            });
        }

        // Attach user document to request for downstream controllers
        const user = await User.findById(decode.userId).select("-password")
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found or deleted"
            });
        }
        req.user = user;
        next();
        
    } catch (error) {
        console.log("protectRoute error ", error);
        res.status(401).json({
            success: false,
            message: "Authentication failed",
        })
    }
}



/**
 * adminRoute - Authorization middleware (must be used AFTER protectRoute)
 * 
 * Checks if the authenticated user's email matches the admin email
 * defined in ENV.ADMIN. Returns 403 Forbidden if not an admin.
 * 
 * NOTE: Admin is determined by email comparison, not a database flag.
 *       This means only one user (the ENV.ADMIN email) can be admin.
 */
export const adminRoute = async (req, res, next) => {
    try {
        if (req.user && req.user.email === ENV.ADMIN) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "admin access required"
            })
        }
    } catch (error) {
        console.error("AdminRoute error: ", error);
        return res.status(500).json({
            success: false,
            message: "Failed to authenticate admin"
        })
    }
}


