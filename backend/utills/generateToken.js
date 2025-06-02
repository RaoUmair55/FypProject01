import jwt from 'jsonwebtoken';

export const generateToken = (userId) => { // Renamed to just generateToken
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15d' });
    return token; // Just return the token string
}