import express from "express";

import {
  createTaskCommentController,
  viewTaskCommentsController,
} from "../controllers/taskCommentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
const router = express.Router();


router.post(
  "/add-comment/:taskId",
  authMiddleware,
  roleMiddleware(["create_task_comment"]),
  createTaskCommentController,
);


router.get(
  "/task-comments/:taskId",
  authMiddleware,
  roleMiddleware(["view_task_comments"]),
  viewTaskCommentsController,
);


export default router;