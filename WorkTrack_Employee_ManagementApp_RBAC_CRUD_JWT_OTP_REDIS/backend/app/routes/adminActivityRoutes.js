
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
  viewAdminActivityController,
} from "../controllers/adminActivityController.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["view_admin_activity"]),
  viewAdminActivityController,
);

export default router;
