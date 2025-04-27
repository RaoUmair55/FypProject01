import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { commentPost, createPost, deletePost, getAllPosts, getFollowedPosts, getUserPosts, likedPost, likeUnLike } from '../controllers/post.controller.js';

const router = express.Router();

router.get("/all", protectRoute, getAllPosts); // Assuming you have a function to get all posts
router.get("/follow", protectRoute, getFollowedPosts); // Assuming you have a function to get all posts
// router.get("/university/:university", protectRoute, getPostsByUniversity); // Assuming you have a function to get posts by university
router.get("/getlikedPost/:id", protectRoute, likedPost); // Assuming you have a function to get posts by like
router.get("/userPosts/:username", protectRoute, getUserPosts); // Assuming you have a function to get posts by like
router.post('/create', protectRoute, createPost);
router.post('/like/:id', protectRoute, likeUnLike);
router.post('/comment/:id', protectRoute, commentPost);
router.delete('/:id', protectRoute, deletePost);

export default router;