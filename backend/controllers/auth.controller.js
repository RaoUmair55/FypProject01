import  {getUniversityFromEmail}  from "../utills/universityUtills.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utills/generateTokenAndSetCookie.js";

export const signup = async (req, res) => {
    try {
        const { username, fullName, email, password,bio } = req.body;
        // Validate input fields
         // Check if all required fields are provided
         // Check if email is in valid format
         // Check if password is at least 6 characters long
         // Check if email belongs to a recognized university domain
        if (!username || !fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        const university = getUniversityFromEmail(email);
        if (!university) {
            return res.status(400).json({ message: "Email does not belong to a recognized university" });
        }
      
        const existedUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existedUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            username,
            fullName,
            email,
            password: hashedPassword,
            university,
            bio,
        });

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            return res.status(201).json({ 
                _id: newUser._id,
                username: newUser.username,
                fullName: newUser.fullName,
                email: newUser.email,
                university: newUser.university,
                bio: newUser.bio,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt,
                followers: newUser.followers,
                following: newUser.following,
             });
        } else {
            res.status(400).json({ message: "User not created" });
        }


    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }  
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const isPasswordMatch = await bcrypt.compare(password, user?.password || "");
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            university: user.university,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            followers: user.followers,
            following: user.following,
         });
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}



export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true, // or false in dev
            sameSite: "strict",
            path: "/",
          });   
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getMe = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error in getMe:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}