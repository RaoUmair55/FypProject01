import  {getUniversityFromEmail}  from "../utills/universityUtills.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utills/generateTokenAndSetCookie.js";
import  sendOTP  from "../utills/mailer.js";

export const signup = async (req, res) => {
    try {
        const { username, fullName, email, password, bio } = req.body;

        if (!username || !fullName || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        const university = getUniversityFromEmail(email);
        if (!university) {
            return res.status(400).json({ error: "Email does not belong to a recognized university" });
        }

        const existedUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existedUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 🔐 Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const newUser = new User({
            username,
            fullName,
            email,
            password: hashedPassword,
            university,
            bio,
            isVerified: false,
            otp,
            otpExpiresAt,
        });

        await newUser.save();
        await sendOTP(email, otp); // 📧 Send OTP to email

        res.status(201).json({ message: "User created. OTP sent to email for verification." });
    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//api/auth/resend-otp
export const resendEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        await sendOTP(email, user.otp);
        res.status(200).json({ message: "Verification email resent" });
    } catch (error) {
        console.error("Error resending email:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// POST /api/auth/verify
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.isVerified) return res.status(400).json({ error: "User already verified" });

    if (user.otp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = "You have verified your email";
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// POST /api/auth/send-otp


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            if (!email){
                return res.status(400).json({ error: "Email is required" });
            }
            else{
                return res.status(400).json({ error: "Password is required" });
            }
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        if (!user.isVerified) {
            return res.status(400).json({ error: "User not verified. Please check your email for the OTP." });
        }
        const isPasswordMatch = await bcrypt.compare(password, user?.password || "");
        if (!isPasswordMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
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
        res.status(500).json({ error: "Internal server error" });
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
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getMe = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error in getMe:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}