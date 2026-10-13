import mongoose from "mongoose";
import ExtraWorkRequest from "../models/ExtraWorkRequest.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import { createNotificationService } from "./notificationServices.js";

const MINUTE_MS = 60 * 1000;
const MAX_DURATION_MINUTES = 12 * 60;

const getISTMidnight = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return new Date(
    Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
    ) - 330 * MINUTE_MS,
  );
};

const getAuthorizedTeam = async (managerId, teamId) => {
  if (
    !mongoose.isValidObjectId(managerId) ||
    !mongoose.isValidObjectId(teamId)
  ) {
    throw new Error("Invalid manager ID or team ID");
  }

  const manager = await User.findOne({
    _id: managerId,
    role: "manager",
  });

  if (!manager) {
    throw new Error("Manager not found");
  }

  const team = await Team.findOne({
    _id: teamId,
    managerId: manager._id,
    isActive: true,
  });

  if (!team) {
    throw new Error(
      "Team not found or you are not authorized to assign work to it",
    );
  }

  if (
    manager.departmentId &&
    team.departmentId &&
    manager.departmentId.toString() !== team.departmentId.toString()
  ) {
    throw new Error("Team does not belong to your department");
  }

  return { manager, team };
};

const validateEmployeeAvailability = async (employee, team) => {
  if (
    !employee ||
    employee.role !== "employee" ||
    !employee.isVerified
  ) {
    throw new Error("A verified employee must be selected");
  }

  if (
    !employee.teamId ||
    employee.teamId.toString() !== team._id.toString()
  ) {
    throw new Error("Employee does not belong to the selected team");
  }

  const activeSession = await ExtraWorkRequest.findOne({
    employeeId: employee._id,
    status: "APPROVED",
    actualEndAt: null,
  });

  if (activeSession) {
    throw new Error(
      `${employee.name} already has an active extra-duty session`,
    );
  }

  const pendingRequest = await ExtraWorkRequest.findOne({
    employeeId: employee._id,
    status: { $in: ["ASSIGNED", "PENDING"] },
  });

  if (pendingRequest) {
    throw new Error(
      `${employee.name} already has a pending extra-work request or assignment`,
    );
  }
};

// Create an extra-duty assignment for one employee or an entire team.
export const createExtraWorkAssignmentService = async (
  managerId,
  data = {},
) => {
  const {
    teamId,
    employeeId,
    targetType,
    title,
    description,
    durationMinutes,
  } = data;

  const cleanTitle = typeof title === "string" ? title.trim() : "";
  const cleanDescription =
    typeof description === "string" ? description.trim() : "";
  const duration = Number(durationMinutes);

  if (cleanTitle.length < 3 || cleanTitle.length > 150) {
    throw new Error("Job title must contain 3 to 150 characters");
  }

  if (
    cleanDescription.length < 3 ||
    cleanDescription.length > 1000
  ) {
    throw new Error("Job details must contain 3 to 1000 characters");
  }

  if (
    !Number.isInteger(duration) ||
    duration < 1 ||
    duration > MAX_DURATION_MINUTES
  ) {
    throw new Error("Duration must be between 1 minute and 12 hours");
  }

  if (!["team", "employee"].includes(targetType)) {
    throw new Error("Target type must be team or employee");
  }

  const { manager, team } = await getAuthorizedTeam(managerId, teamId);

  let employees;

  if (targetType === "employee") {
    if (!mongoose.isValidObjectId(employeeId)) {
      throw new Error("A valid employee must be selected");
    }

    const employee = await User.findById(employeeId);

    await validateEmployeeAvailability(employee, team);

    employees = [employee];
  } else {
    employees = await User.find({
      role: "employee",
      isVerified: true,
      teamId: team._id,
    });

    if (!employees.length) {
      throw new Error("The selected team has no verified employees");
    }

    // Validate all employees before creating any assignments.
    for (const employee of employees) {
      await validateEmployeeAvailability(employee, team);
    }
  }

  const now = new Date();

  const assignments = await ExtraWorkRequest.insertMany(
    employees.map((employee) => ({
      employeeId: employee._id,
      teamId: team._id,
      attendanceDate: getISTMidnight(now),
      employeeReason: cleanDescription,
      taskTitle: cleanTitle,
      taskDescription: cleanDescription,
      assignedBy: manager._id,
      requestedAt: now,
      status: "ASSIGNED",
      approvedDurationMinutes: duration,
    })),
  );

  // Notifications must not undo successfully created assignments.
  for (const assignment of assignments) {
    try {
      await createNotificationService({
        recipientId: assignment.employeeId,
        type: "EXTRA_WORK_ASSIGNED",
        title: "New extra-duty assignment",
        message:
          `${cleanTitle}: ${cleanDescription}. ` +
          `Expected duration: ${duration} minutes. ` +
          "Open this notification to review and accept the assignment.",
        relatedId: assignment._id,
      });
    } catch (error) {
      console.error(
        `Could not notify employee for assignment ${assignment._id}:`,
        error.message,
      );
    }
  }

  return {
    assignedCount: assignments.length,
    assignments,
  };
};

// Get assignments created by the current manager.
export const getManagerExtraWorkAssignmentsService = async (
  managerId,
) => {
  if (!mongoose.isValidObjectId(managerId)) {
    throw new Error("Invalid manager ID");
  }

  const manager = await User.findOne({
    _id: managerId,
    role: "manager",
  });

  if (!manager) {
    throw new Error("Manager not found");
  }

  const teams = await Team.find({
    managerId: manager._id,
    isActive: true,
  }).select("_id");

  return ExtraWorkRequest.find({
    assignedBy: manager._id,
    teamId: { $in: teams.map((team) => team._id) },
  })
    .sort({ requestedAt: -1 })
    .populate("employeeId", "name email designation")
    .populate("teamId", "name")
    .populate("assignedBy", "name email");
};

// Get extra-duty assignments belonging to an employee.
export const getMyExtraWorkAssignmentsService = async (employeeId) => {
  if (!mongoose.isValidObjectId(employeeId)) {
    throw new Error("Invalid employee ID");
  }

  return ExtraWorkRequest.find({
    employeeId,
    assignedBy: { $ne: null },
  })
    .sort({ requestedAt: -1 })
    .populate("teamId", "name")
    .populate("assignedBy", "name email");
};

// Accept an assignment and start its extra-duty session.
export const acceptExtraWorkAssignmentService = async (
  employeeId,
  assignmentId,
) => {
  if (
    !mongoose.isValidObjectId(employeeId) ||
    !mongoose.isValidObjectId(assignmentId)
  ) {
    throw new Error("Invalid employee ID or assignment ID");
  }

  const assignment = await ExtraWorkRequest.findOne({
    _id: assignmentId,
    employeeId,
    assignedBy: { $ne: null },
    status: "ASSIGNED",
    actualStartAt: null,
    actualEndAt: null,
  });

  if (!assignment) {
    throw new Error(
      "Assignment not found, already accepted, or no longer available",
    );
  }

  const activeSession = await ExtraWorkRequest.findOne({
    employeeId,
    status: "APPROVED",
    actualEndAt: null,
  });

  if (activeSession) {
    throw new Error("You already have an active extra-duty session");
  }

  const duration = Number(assignment.approvedDurationMinutes);

  if (
    !Number.isInteger(duration) ||
    duration < 1 ||
    duration > MAX_DURATION_MINUTES
  ) {
    throw new Error("Assignment duration is invalid");
  }

  const now = new Date();

  // Conditional update prevents two simultaneous acceptance requests
  // from accepting the same assignment.
  const accepted = await ExtraWorkRequest.findOneAndUpdate(
    {
      _id: assignment._id,
      employeeId,
      assignedBy: { $ne: null },
      status: "ASSIGNED",
      actualStartAt: null,
      actualEndAt: null,
    },
    {
      $set: {
        status: "APPROVED",
        actualStartAt: now,
        approvedEndAt: new Date(
          now.getTime() + duration * MINUTE_MS,
        ),
        decisionAt: now,
        approvedBy: assignment.assignedBy,
      },
    },
    { new: true },
  )
    .populate("teamId", "name")
    .populate("assignedBy", "name email");

  if (!accepted) {
    throw new Error(
      "Assignment has already been accepted or changed",
    );
  }

  return accepted;
};

// Reject an assignment that has not been accepted or started.
export const rejectExtraWorkAssignmentService = async (
  employeeId,
  assignmentId,
) => {
  if (
    !mongoose.isValidObjectId(employeeId) ||
    !mongoose.isValidObjectId(assignmentId)
  ) {
    throw new Error("Invalid employee ID or assignment ID");
  }

  const rejected = await ExtraWorkRequest.findOneAndUpdate(
    {
      _id: assignmentId,
      employeeId,
      assignedBy: { $ne: null },
      status: "ASSIGNED",
      actualStartAt: null,
      actualEndAt: null,
    },
    {
      $set: {
        status: "REJECTED",
        decisionAt: new Date(),
        managerReason: "Declined by employee",
      },
    },
    { new: true },
  );

  if (!rejected) {
    throw new Error("Assignment not found or already processed");
  }

  return rejected;
};

// Delete an assignment only if it belongs to this manager and
// has not been accepted, started, or completed.
export const deleteExtraWorkAssignmentService = async (
  managerId,
  assignmentId,
) => {
  if (!mongoose.isValidObjectId(assignmentId)) {
    throw new Error("Invalid extra-task assignment ID");
  }

  const assignment = await ExtraWorkRequest.findById(assignmentId);

  if (!assignment) {
    throw new Error("Extra-task assignment not found");
  }

  // A manager can only delete an assignment they created.
  if (
    !assignment.assignedBy ||
    String(assignment.assignedBy) !== String(managerId)
  ) {
    throw new Error("Not authorized to delete this assignment");
  }

  const deletableStatuses = [
    "ASSIGNED",
    "COMPLETED",
    "EXPIRED",
    "REJECTED",
  ];

  // Reject statuses that must not be deleted, including active assignments.
  if (!deletableStatuses.includes(assignment.status)) {
    throw new Error(
      "Cannot delete an accepted or ongoing assignment",
    );
  }

  // An ASSIGNED assignment can be deleted only before it starts.
  // Completed, expired, and rejected assignments may have historical timestamps.
  if (
    assignment.status === "ASSIGNED" &&
    (assignment.actualStartAt || assignment.actualEndAt)
  ) {
    throw new Error(
      "Cannot delete an assigned entry that has already started",
    );
  }

  // Recheck ownership and status during deletion to avoid deleting an
  // assignment whose state changed after it was initially retrieved.
  const result = await ExtraWorkRequest.deleteOne({
    _id: assignment._id,
    assignedBy: managerId,
    status: assignment.status,
    ...(assignment.status === "ASSIGNED"
      ? {
          actualStartAt: null,
          actualEndAt: null,
        }
      : {}),
  });

  if (result.deletedCount !== 1) {
    throw new Error(
      "Assignment could not be deleted because its status changed. Refresh and try again.",
    );
  }

  return {
    _id: assignment._id,
    deleted: true,
  };
};