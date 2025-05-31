import express from 'express';

const router = express.Router();


import { signup, login, logout, getMe, verifyOTP, resendEmail, forgetPassword, resetPassword } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
import sendOTP from "../utills/mailer.js";



router.get("/getMe", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendEmail);
router.post("/forgetPassword", forgetPassword);
router.post("/resetPassword", resetPassword);


export default router