// --- Backend: utils/generateToken.js (or wherever this function is) ---
import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15d' });

    res.cookie('token', token, {
        httpOnly: true,
        // IMPORTANT: secure MUST be true for SameSite: 'None' to work.
        // This ensures the cookie is only sent over HTTPS.
        secure: true, 
        // SameSite: 'None' allows cross-site requests to send the cookie.
        sameSite: 'None', 
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        // You generally don't need to explicitly set 'Domain' for cross-origin cookies
        // if SameSite: 'None' is correctly configured and the cookie is for the issuing domain.
        // If you were to set it, it would be for the backend domain, not the frontend.
        // For example: domain: '.onrender.com' or 'fypproject01.onrender.com'
        // But let's leave it out for now as it's often handled implicitly.
    });
}