import jwt from 'jsonwebtoken';
import { JWT_SECRET, NODE_ENV } from '../config/env.js';

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15d' });

    res.cookie('token', token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        httpOnly: true, // Prevent XSS attacks
        sameSite: NODE_ENV === "development" ? "lax" : "none", // CSRF protection / Cross-site usage
        secure: NODE_ENV !== "development", // HTTPS only in production
    });

    return token; // Return token in case we need it for response body
}