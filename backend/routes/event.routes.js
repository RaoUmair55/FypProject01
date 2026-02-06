import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { createEvent, getEvents, deleteEvent } from "../controllers/event.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getEvents);
router.post("/create", protectRoute, createEvent);
router.delete("/:id", protectRoute, deleteEvent);

export default router;
