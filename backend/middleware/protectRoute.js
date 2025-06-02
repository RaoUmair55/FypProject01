import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers.authorization; 
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // If no Authorization header or it doesn't start with 'Bearer '
            return res.status(401).json({ error: "Unauthorized: No token provided or malformed." });
        }

        // Extract the token (remove "Bearer ")
        const token = authHeader.split(' ')[1]; 

        if (!token) {
            // This check might be redundant if the split failed but good for clarity
            return res.status(401).json({ error: "Unauthorized: Token missing after 'Bearer '." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ error: "Unauthorized: User not found." });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute:", error);
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Unauthorized: Token has expired." });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Unauthorized: Invalid token." });
        }
        res.status(500).json({ error: "Internal server error." });
    }
}