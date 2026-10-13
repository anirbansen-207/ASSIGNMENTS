import express from "express";

import {
  viewMyNotificationsController,
  viewUnreadNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
} from "../controllers/notificationControllers.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/my-notifications",
  authMiddleware,
  roleMiddleware(["view_notifications"]),
  viewMyNotificationsController,
);

router.get(
  "/unread",
  authMiddleware,
  roleMiddleware(["view_notifications"]),
  viewUnreadNotificationsController,
);

router.patch(
  "/read/:notificationId",
  authMiddleware,
  roleMiddleware(["manage_notifications"]),
  markNotificationReadController,
);

router.patch(
  "/read-all",
  authMiddleware,
  roleMiddleware(["manage_notifications"]),
  markAllNotificationsReadController,
);

export default router;