import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
  viewTaskActivitiesController,
} from "../controllers/taskActivityControllers.js";

const router = express.Router();

router.get(
  "/:taskId",
  authMiddleware,
  roleMiddleware(["view_task_activity"]),
  viewTaskActivitiesController,
);

export default router;