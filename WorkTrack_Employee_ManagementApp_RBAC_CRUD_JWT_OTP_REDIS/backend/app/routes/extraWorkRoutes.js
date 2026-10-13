
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
  requestExtraWorkController,
  getMyExtraWorkRequestsController,
  getPendingExtraWorkRequestsController,
  decideExtraWorkRequestController,
  checkOutExtraWorkController,
  getExtraTimeSummaryController,
} from "../controllers/extraWorkController.js";

import {
  createExtraWorkAssignmentController,
  getManagerExtraWorkAssignmentsController,
  getMyExtraWorkAssignmentsController,
  acceptExtraWorkAssignmentController,
  rejectExtraWorkAssignmentController,
   deleteExtraWorkAssignmentController,
} from "../controllers/extraWorkAssignmentController.js";

const router = express.Router();

// Manager creates an assignment for one employee or every employee in a team.
router.post(
  "/assign",
  authMiddleware,
  roleMiddleware(["assign_extra_work"]),
  createExtraWorkAssignmentController,
);

// Employee views manager-created assignments.
router.get(
  "/my-assignments",
  authMiddleware,
  roleMiddleware(["view_my_extra_work"]),
  getMyExtraWorkAssignmentsController,
);

// Employee accepts an assignment; this starts extra-duty attendance.
router.post(
  "/assignments/:assignmentId/accept",
  authMiddleware,
  roleMiddleware(["view_my_extra_work"]),
  acceptExtraWorkAssignmentController,
);

// Employee declines an assignment without starting attendance.
router.post(
  "/assignments/:assignmentId/reject",
  authMiddleware,
  roleMiddleware(["view_my_extra_work"]),
  rejectExtraWorkAssignmentController,
);

// Existing employee-created extra-work request flow.
router.post(
  "/request",
  authMiddleware,
  roleMiddleware(["request_extra_work"]),
  requestExtraWorkController,
);

router.get(
  "/my-requests",
  authMiddleware,
  roleMiddleware(["view_my_extra_work"]),
  getMyExtraWorkRequestsController,
);

router.get(
  "/my-summary",
  authMiddleware,
  roleMiddleware(["view_my_extra_work"]),
  getExtraTimeSummaryController,
);

router.post(
  "/checkout/:requestId",
  authMiddleware,
  roleMiddleware(["checkout_extra_work"]),
  checkOutExtraWorkController,
);

// Existing manager review flow for employee-created requests.
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware(["review_extra_work"]),
  getPendingExtraWorkRequestsController,
);

router.patch(
  "/:requestId/:decision",
  authMiddleware,
  roleMiddleware(["review_extra_work"]),
  decideExtraWorkRequestController,
);

// Manager views assignments created by them.
router.get(
  "/manager-assignments",
  authMiddleware,
  roleMiddleware(["assign_extra_work"]),
  getManagerExtraWorkAssignmentsController,
);

// Manager deletes an assignment they created, provided it has not started.
router.delete(
  "/assignments/:assignmentId",
  authMiddleware,
  roleMiddleware(["assign_extra_work"]),
  deleteExtraWorkAssignmentController,
);


export default router;
