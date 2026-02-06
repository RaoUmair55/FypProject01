import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { createResource, getResources, deleteResource } from "../controllers/resource.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getResources);
router.post("/create", protectRoute, createResource);
router.delete("/:id", protectRoute, deleteResource);

export default router;
