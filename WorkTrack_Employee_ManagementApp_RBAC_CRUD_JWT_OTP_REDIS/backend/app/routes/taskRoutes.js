import express from "express";

import {
  createTaskController,
  viewAllTasksController,
  viewSingleTaskController,
  updateTaskController,
  deleteTaskController,
  viewMyTasksController,
  viewMyTeamTasksController,
  acceptTaskController,
  updateTaskStatusController,
  updateTaskProgressController,
} from "../controllers/taskController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// ======================================================
// EMPLOYEE ROUTES
// ======================================================

// Employee → View own tasks
router.get(
  "/my-tasks",
  authMiddleware,
  roleMiddleware(["view_my_tasks"]),
  viewMyTasksController
);


// Employee → View tasks of own team
router.get(
  "/my-team-tasks",
  authMiddleware,
  roleMiddleware(["view_my_team_tasks"]),
  viewMyTeamTasksController
);


// Employee → Accept assigned task
router.patch(
  "/accept-task/:taskId",
  authMiddleware,
  roleMiddleware(["update_task_status"]),
  acceptTaskController
);


// ======================================================
// ADMIN / MANAGER ROUTES
// ======================================================

// Create task
router.post(
  "/create-task",
  authMiddleware,
  roleMiddleware(["create_task"]),
  createTaskController
);


// View all tasks
router.get(
  "/all-tasks",
  authMiddleware,
  roleMiddleware(["view_tasks"]),
  viewAllTasksController
);


// View single task
router.get(
  "/task-details/:taskId",
  authMiddleware,
  roleMiddleware(["view_task"]),
  viewSingleTaskController
);


// Update task
router.put(
  "/update-task/:taskId",
  authMiddleware,
  roleMiddleware(["update_task"]),
  updateTaskController
);


// Delete task
router.delete(
  "/delete-task/:taskId",
  authMiddleware,
  roleMiddleware(["delete_task"]),
  deleteTaskController
);


// ======================================================
// TASK WORKFLOW
// ======================================================

// Update task status
router.patch(
  "/update-status/:taskId",
  authMiddleware,
  roleMiddleware(["update_task_status"]),
  updateTaskStatusController
);


// Update task progress
router.patch(
  "/update-progress/:taskId",
  authMiddleware,
  roleMiddleware(["update_task_progress"]),
  updateTaskProgressController
);


export default router;