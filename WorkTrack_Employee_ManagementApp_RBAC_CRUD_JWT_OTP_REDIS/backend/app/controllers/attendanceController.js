
import {
  checkInService,
  checkOutService,
  startBreakService,
  endBreakService,
  viewMyAttendanceService,
  viewTeamAttendanceService,
  viewTeamAttendanceByDateService,
  viewAllAttendanceService,
  viewAllAttendanceByDateService,
  viewAttendanceByDateAndTeamService,
  correctAttendanceService,
} from "../services/attendanceServices.js";

import {
  createAdminActivityEventService,
} from "../services/adminActivityServices.js";

import {
  correctAttendanceValidation,
} from "../validations/attendanceValidation.js";

// Activity logging is supplementary and must never block an attendance action.
const recordAttendanceActivity = async (payload) => {
  try {
    await createAdminActivityEventService(payload);
  } catch (error) {
    console.error(
      "Failed to record attendance admin activity:",
      error.message,
    );
  }
};

// Return useful HTTP status codes for expected attendance-rule failures.
const sendAttendanceError = (res, error) => {
  const message = error?.message || "Attendance request failed";
  let statusCode = 500;

  if (/outside your scheduled shift/i.test(message)) {
    statusCode = 409;
  }

  if (/not authorized|not allowed|unauthorized/i.test(message)) {
    statusCode = 403;
  } else if (/not found/i.test(message)) {
    statusCode = 404;
  } else if (
    /already exists|already used|already checked|already ended|duplicate/i.test(
      message,
    )
  ) {
    statusCode = 409;
  } else if (
    /invalid|must |cannot|can't|have not|has not|approved leave|shift has ended|break|check-in|check in|check-out|check out|absent employees|not assigned|not configured|attendance record/i.test(
      message,
    )
  ) {
    statusCode = 400;
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

// Employee checks in.
export const checkInController = async (req, res) => {
  try {
    const attendance = await checkInService(req.user._id);

    await recordAttendanceActivity({
      actorId: req.user._id,
      subjectUserId: req.user._id,
      type: attendance.isLate
        ? "ATTENDANCE_LATE"
        : "ATTENDANCE_CHECKED_IN",
      title: attendance.isLate
        ? "Late Check-In"
        : "Employee Checked In",
      message: `${req.user.name} checked in${
        attendance.isLate
          ? ` ${attendance.lateMinutes} minute(s) late`
          : ""
      }.`,
      relatedId: attendance._id,
    });

    return res.status(201).json({
      success: true,
      message: "Checked in successfully",
      data: attendance,
    });
  } catch (error) {
    return sendAttendanceError(res, error);
  }
};

// Employee checks out.
export const checkOutController = async (req, res) => {
  try {
    const attendance = await checkOutService(req.user._id);

    await recordAttendanceActivity({
      actorId: req.user._id,
      subjectUserId: req.user._id,
      type: "ATTENDANCE_CHECKED_OUT",
      title: "Employee Checked Out",
      message: `${req.user.name} checked out for the shift.`,
      relatedId: attendance._id,
    });

    return res.status(200).json({
      success: true,
      message: "Checked out successfully",
      data: attendance,
    });
  } catch (error) {
    return sendAttendanceError(res, error);
  }
};

// Employee starts their one permitted break.
export const startBreakController = async (req, res) => {
  try {
    const attendance = await startBreakService(req.user._id);

    await recordAttendanceActivity({
      actorId: req.user._id,
      subjectUserId: req.user._id,
      type: "ATTENDANCE_BREAK_STARTED",
      title: "Break Started",
      message: `${req.user.name} started their break.`,
      relatedId: attendance._id,
    });

    return res.status(200).json({
      success: true,
      message: "Break started successfully",
      data: attendance,
    });
  } catch (error) {
    return sendAttendanceError(res, error);
  }
};

// Employee ends their break.
export const endBreakController = async (req, res) => {
  try {
    const attendance = await endBreakService(req.user._id);

    await recordAttendanceActivity({
      actorId: req.user._id,
      subjectUserId: req.user._id,
      type: "ATTENDANCE_BREAK_ENDED",
      title: "Break Ended",
      message: `${req.user.name} ended their break.`,
      relatedId: attendance._id,
    });

    return res.status(200).json({
      success: true,
      message: "Break ended successfully",
      data: attendance,
    });
  } catch (error) {
    return sendAttendanceError(res, error);
  }
};

// Employee views their attendance history.
export const viewMyAttendanceController = async (req, res) => {
  try {
    const attendance = await viewMyAttendanceService(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Attendance fetched successfully",
      data: attendance,
    });
  } catch (error) {
    return sendAttendanceError(res, error);
  }
};

// Manager views attendance for a specific team.
export const viewTeamAttendanceController = async (req, res) => {
  try {
    const attendance = await viewTeamAttendanceService(
      req.user._id,
      req.params.teamId,
    );

    return res.status(200).json({
      success: true,
      message: "Team attendance fetched successfully",
      data: attendance,
    });
  } catch (error) {
    return sendAttendanceError(res, error);
  }
};

// Manager views attendance for a team and selected date.
export const viewTeamAttendanceByDateController = async (
  req,
  res,
) => {
  try {
    const attendance = await viewTeamAttendanceByDateService(
      req.user._id,
      req.params.teamId,
      req.query.date,
    );

    return res.status(200).json({
      success: true,
      message:
        "Team attendance for the selected date fetched successfully",
      data: attendance,
    });
  } catch (error) {
    return sendAttendanceError(res, error);
  }
};

// Admin views all saved attendance records.
export const viewAllAttendanceController = async (req, res) => {
  try {
    const attendance = await viewAllAttendanceService();

    return res.status(200).json({
      success: true,
      message: "All attendance fetched successfully",
      data: attendance,
    });
  } catch (error) {
    return sendAttendanceError(res, error);
  }
};

// Admin views attendance for a selected date.
export const viewAllAttendanceByDateController = async (
  req,
  res,
) => {
  try {
    const attendance = await viewAllAttendanceByDateService(
      req.query.date,
    );

    return res.status(200).json({
      success: true,
      message:
        "Attendance for the selected date fetched successfully",
      data: attendance,
    });
  } catch (error) {
    return sendAttendanceError(res, error);
  }
};

// Admin filters attendance by date and team.
export const viewAttendanceByDateAndTeamController = async (
  req,
  res,
) => {
  try {
    const attendance = await viewAttendanceByDateAndTeamService(
      req.query.date,
      req.query.teamId,
    );

    return res.status(200).json({
      success: true,
      message:
        "Team attendance for the selected date fetched successfully",
      data: attendance,
    });
  } catch (error) {
    return sendAttendanceError(res, error);
  }
};

// Admin corrects an attendance record.
export const correctAttendanceController = async (req, res) => {
  try {
    const { error } = correctAttendanceValidation.validate(
      req.body,
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const attendance = await correctAttendanceService(
      req.params.attendanceId,
      req.body,
      req.user._id,
    );

    await recordAttendanceActivity({
      actorId: req.user._id,
      subjectUserId: attendance.employeeId,
      type: "ATTENDANCE_CORRECTED",
      title: "Attendance Corrected",
      message: `${req.user.name} corrected an attendance record.`,
      relatedId: attendance._id,
    });

    return res.status(200).json({
      success: true,
      message: "Attendance corrected successfully",
      data: attendance,
    });
  } catch (error) {
    return sendAttendanceError(res, error);
  }
};
