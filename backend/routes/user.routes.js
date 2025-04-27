import express from 'express';
import { get } from 'mongoose';
import { protectRoute } from '../middleware/protectRoute.js';
import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUserProfile } from '../controllers/user.controller.js';

const router = express.Router();    

router.get ("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers); // Assuming you have a function to get suggested users   
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/updateProfile", protectRoute, updateUserProfile);

export default router;