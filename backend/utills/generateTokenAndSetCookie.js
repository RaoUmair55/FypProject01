import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15d' });
    res.cookie('token', token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        sameSite: 'strict', // CSRF protection cross site request forgery attack
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });
}
