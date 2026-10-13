
import express from "express";

import {
  checkInController,
  checkOutController,
  startBreakController,
  endBreakController,
  viewMyAttendanceController,
  viewTeamAttendanceController,
  viewTeamAttendanceByDateController,
  viewAllAttendanceController,
  viewAllAttendanceByDateController,
  viewAttendanceByDateAndTeamController,
  correctAttendanceController,
} from "../controllers/attendanceController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Employee checks in for the current shift.
router.post(
  "/check-in",
  authMiddleware,
  roleMiddleware(["check_in"]),
  checkInController,
);

// Employee checks out after completing their work.
router.post(
  "/check-out",
  authMiddleware,
  roleMiddleware(["check_out"]),
  checkOutController,
);

// Employee starts their one permitted break for the shift.
router.post(
  "/break/start",
  authMiddleware,
  roleMiddleware(["start_attendance_break"]),
  startBreakController,
);

// Employee ends their break early.
// The backend enforces the maximum 90-minute break duration.
router.post(
  "/break/end",
  authMiddleware,
  roleMiddleware(["end_attendance_break"]),
  endBreakController,
);

// Employee views their own attendance history.
router.get(
  "/my-attendance",
  authMiddleware,
  roleMiddleware(["view_my_attendance"]),
  viewMyAttendanceController,
);

// Manager views attendance for a specific team.
router.get(
  "/team-attendance/:teamId",
  authMiddleware,
  roleMiddleware(["view_team_attendance"]),
  viewTeamAttendanceController,
);

// Manager views attendance for a specific team and date.
router.get(
  "/team-attendance/:teamId/by-date",
  authMiddleware,
  roleMiddleware(["view_team_attendance"]),
  viewTeamAttendanceByDateController,
);

// Admin views all attendance records.
router.get(
  "/all-attendance",
  authMiddleware,
  roleMiddleware(["view_all_attendance"]),
  viewAllAttendanceController,
);

// Admin views all attendance records for a specific date.
router.get(
  "/all-attendance/by-date",
  authMiddleware,
  roleMiddleware(["view_all_attendance"]),
  viewAllAttendanceByDateController,
);

// Admin filters attendance by date and team.
router.get(
  "/all-attendance/by-date-and-team",
  authMiddleware,
  roleMiddleware(["view_all_attendance"]),
  viewAttendanceByDateAndTeamController,
);

// Admin corrects an attendance record.
router.patch(
  "/correct-attendance/:attendanceId",
  authMiddleware,
  roleMiddleware(["correct_attendance"]),
  correctAttendanceController,
);

export default router;
