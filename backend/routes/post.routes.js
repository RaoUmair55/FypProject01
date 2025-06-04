import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { upload } from '../middleware/multer.middleware.js';
import { commentPost, createPost, deletePost, getAllPosts, getFollowedPosts, getPostsByCategory, getUserPosts, likedPost, likeUnLike } from '../controllers/post.controller.js';

const router = express.Router();

router.get("/all", protectRoute, getAllPosts); 
router.get("/following", protectRoute, getFollowedPosts); 
router.get("/getlikedPost/:userId", protectRoute, likedPost);
router.get("/userPosts/:username", protectRoute, getUserPosts);
router.post('/create', protectRoute, upload.single("image"), createPost);
router.post('/like/:id', protectRoute, likeUnLike);
app.use(express.json()); // Ensure JSON body parsing is enabled
router.post('/comment/:id', express.json(), protectRoute, commentPost);
router.delete('/:id', protectRoute, deletePost);
router.get("/category/:categorytype", protectRoute, getPostsByCategory);

export default router;