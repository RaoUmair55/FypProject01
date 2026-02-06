import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { adminRoute, superAdminRoute } from "../middleware/adminRoute.js";
import { getDashboardStats, createAdmin, deleteUser, deletePost, getAllAdmins, getUniversityStudents, getUniversityPosts } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/stats", protectRoute, adminRoute, getDashboardStats);
router.get("/admins", protectRoute, superAdminRoute, getAllAdmins);
router.get("/students", protectRoute, adminRoute, getUniversityStudents);
router.get("/posts", protectRoute, adminRoute, getUniversityPosts);
router.post("/create-admin", protectRoute, superAdminRoute, createAdmin);
router.delete("/user/:id", protectRoute, adminRoute, deleteUser);
router.delete("/post/:id", protectRoute, adminRoute, deletePost);

export default router;
