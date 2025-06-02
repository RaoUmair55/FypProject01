import express from 'express';

const router = express.Router();


import { signup, login, logout, getMe, verifyOTP, resendEmail, forgetPassword, resetPassword } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
import sendOTP from "../utills/mailer.js";



router.get("/getMe",express.json(), protectRoute, getMe);
router.post("/signup", express.json(), signup);
router.post("/login", express.json(), login);
router.post("/logout", express.json(), logout);
router.post("/verify-otp", express.json(), verifyOTP);
router.post("/resend-otp", express.json(), resendEmail);
router.post("/forgetPassword", express.json(), forgetPassword);
router.post("/resetPassword", express.json(), resetPassword);


export default router