import express from 'express';

const router = express.Router();


import { signup, login, logout, getMe, verifyOTP } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
import sendOTP from "../utills/mailer.js";



router.get("/getMe", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-otp", verifyOTP);


router.get("/test-email", async (req, res) => {
  try {
    console.log('EMAIL:', process.env.EMAIL);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
    await sendOTP("hackthecode404@gmail.com", "123456");
    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router