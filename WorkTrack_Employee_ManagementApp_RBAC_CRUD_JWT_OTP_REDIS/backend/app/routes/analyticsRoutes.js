import express from "express";

import {
  getAnalyticsOverviewController,
} from "../controllers/analyticsControllers.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/overview",
  authMiddleware,
  roleMiddleware(["view_analytics"]),
  getAnalyticsOverviewController,
);

export default router;