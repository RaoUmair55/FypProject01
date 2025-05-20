import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { deleteNotification, getNotification, getNotificationNumber, markNotificationRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.get("/", protectRoute, getNotification)
router.delete("/", protectRoute, deleteNotification)
//number of notifications
 router.get("/number", protectRoute, getNotificationNumber)
router.put("/:id/read", protectRoute, markNotificationRead);
export default router;