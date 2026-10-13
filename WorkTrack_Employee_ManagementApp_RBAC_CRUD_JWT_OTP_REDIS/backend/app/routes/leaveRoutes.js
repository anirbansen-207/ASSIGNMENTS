import express from "express";

import {
  createLeaveController,
  viewMyLeaveController,
  viewTeamLeaveController,
  reviewLeaveController,
  viewAllLeaveController,
  viewMyLeaveBalanceController,
  setLeaveBalanceController,
  viewLeaveCalendarController,
  viewTeamLeaveCalendarController,
} from "../controllers/leaveControllers.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router =
  express.Router();

// Employee submits leave
router.post(
  "/create-leave",
  authMiddleware,
  roleMiddleware([
    "create_leave",
  ]),
  createLeaveController,
);

// Employee views own leave history
router.get(
  "/my-leaves",
  authMiddleware,
  roleMiddleware([
    "view_my_leave",
  ]),
  viewMyLeaveController,
);

// Employee views own balance
router.get(
  "/my-balance",
  authMiddleware,
  roleMiddleware([
    "view_my_leave_balance",
  ]),
  viewMyLeaveBalanceController,
);

// Manager views team leave requests
router.get(
  "/team-leaves",
  authMiddleware,
  roleMiddleware([
    "view_team_leave",
  ]),
  viewTeamLeaveController,
);

// Manager reviews leave
router.patch(
  "/review/:leaveId",
  authMiddleware,
  roleMiddleware([
    "review_leave",
  ]),
  reviewLeaveController,
);

// Admin views all leaves
router.get(
  "/all-leaves",
  authMiddleware,
  roleMiddleware([
    "view_all_leave",
  ]),
  viewAllLeaveController,
);

// Admin configures employee balance
router.post(
  "/set-balance",
  authMiddleware,
  roleMiddleware([
    "manage_leave_balance",
  ]),
  setLeaveBalanceController,
);

// Admin views leave calendar
router.get(
  "/calendar",
  authMiddleware,
  roleMiddleware([
    "view_leave_calendar",
  ]),
  viewLeaveCalendarController,
);

// Manager views team calendar
router.get(
  "/team-calendar",
  authMiddleware,
  roleMiddleware([
    "view_team_leave_calendar",
  ]),
  viewTeamLeaveCalendarController,
);

export default router;