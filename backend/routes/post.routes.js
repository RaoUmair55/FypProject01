import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { upload } from '../middleware/multer.middleware.js';
import { commentPost, createPost, deletePost, getAllPosts, getFollowedPosts, getUserPosts, likedPost, likeUnLike } from '../controllers/post.controller.js';

const router = express.Router();

router.get("/all", protectRoute, getAllPosts); 
router.get("/following", protectRoute, getFollowedPosts); 
// router.get("/university/:university", protectRoute, getPostsByUniversity);
router.get("/getlikedPost/:id", protectRoute, likedPost);
router.get("/userPosts/:username", protectRoute, getUserPosts);
router.post('/create', protectRoute, upload.single("image"), createPost);
router.post('/like/:id', protectRoute, likeUnLike);
router.post('/comment/:id', protectRoute, commentPost);
router.delete('/:id', protectRoute, deletePost);

export default router;