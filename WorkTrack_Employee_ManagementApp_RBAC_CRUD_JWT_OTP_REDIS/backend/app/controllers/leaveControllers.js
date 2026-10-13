
import {
  createLeaveService,
  viewMyLeaveService,
  viewTeamLeaveService,
  reviewLeaveService,
  viewAllLeaveService,
  viewMyLeaveBalanceService,
  setLeaveBalanceService,
  viewLeaveCalendarService,
  viewTeamLeaveCalendarService,
} from "../services/leaveServices.js";

import {
  createAdminActivityEventService,
} from "../services/adminActivityServices.js";

export const createLeaveController = async (req, res) => {
  try {
    const leave = await createLeaveService(
      req.body,
      req.user._id,
    );

    try {
      await createAdminActivityEventService({
        actorId: req.user._id,
        type: "LEAVE_REQUESTED",
        title: "Leave Request Submitted",
        message: `${req.user.name} submitted a ${leave.leaveType} leave request for ${leave.totalDays} day(s).`,
        relatedId: leave._id,
        subjectUserId: leave.employeeId,
      });
    } catch (activityError) {
      console.error(
        "Failed to record leave request activity:",
        activityError.message,
      );
    }

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      data: leave,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewMyLeaveController = async (
  req,
  res,
) => {
  try {
    const leaves = await viewMyLeaveService(
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: "Leave history fetched successfully",
      data: leaves,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewTeamLeaveController = async (
  req,
  res,
) => {
  try {
    const leaves = await viewTeamLeaveService(
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: "Team leave requests fetched successfully",
      data: leaves,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const reviewLeaveController = async (
  req,
  res,
) => {
  try {
    const leave = await reviewLeaveService(
      req.params.leaveId,
      req.body,
      req.user._id,
    );

    try {
      const approved = leave.status === "APPROVED";

      await createAdminActivityEventService({
        actorId: req.user._id,
        type: approved
          ? "LEAVE_APPROVED"
          : "LEAVE_REJECTED",
        title: approved
          ? "Leave Approved"
          : "Leave Rejected",
        message: `${req.user.name} ${
          approved ? "approved" : "rejected"
        } a leave request.`,
        relatedId: leave._id,
        subjectUserId: leave.employeeId,
      });
    } catch (activityError) {
      console.error(
        "Failed to record leave review activity:",
        activityError.message,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Leave request reviewed successfully",
      data: leave,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewAllLeaveController = async (
  req,
  res,
) => {
  try {
    const leaves = await viewAllLeaveService();

    return res.status(200).json({
      success: true,
      message: "All leave requests fetched successfully",
      data: leaves,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewMyLeaveBalanceController = async (
  req,
  res,
) => {
  try {
    const balances = await viewMyLeaveBalanceService(
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: "Leave balance fetched successfully",
      data: balances,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const setLeaveBalanceController = async (
  req,
  res,
) => {
  try {
    const balance = await setLeaveBalanceService(
      req.body,
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: "Leave balance configured successfully",
      data: balance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewLeaveCalendarController = async (
  req,
  res,
) => {
  try {
    const leaves = await viewLeaveCalendarService();

    return res.status(200).json({
      success: true,
      message: "Leave calendar fetched successfully",
      data: leaves,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewTeamLeaveCalendarController = async (
  req,
  res,
) => {
  try {
    const leaves = await viewTeamLeaveCalendarService(
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: "Team leave calendar fetched successfully",
      data: leaves,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
