
import mongoose from "mongoose";
import ExtraWorkRequest from "../models/ExtraWorkRequest.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import { createNotificationService } from "./notificationServices.js";

const TIME_ZONE = "Asia/Kolkata";
const MINUTE_MS = 60 * 1000;
const MAX_APPROVED_MINUTES = 12 * 60;

const getISTParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => ["year", "month", "day"].includes(part.type))
      .map((part) => [part.type, Number(part.value)]),
  );
};

const getISTMidnight = (date = new Date()) => {
  const { year, month, day } = getISTParts(date);

  return new Date(
    Date.UTC(year, month - 1, day) - 330 * MINUTE_MS,
  );
};

const getShiftWindow = (team, date = new Date()) => {
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(team.checkInTime || "")) {
    throw new Error("Your team shift start time is not configured");
  }

  const { year, month, day } = getISTParts(date);
  const [hours, minutes] = team.checkInTime.split(":").map(Number);

  const start = new Date(
    Date.UTC(year, month - 1, day, hours, minutes) - 330 * MINUTE_MS,
  );

  return {
    start,
    end: new Date(start.getTime() + 8 * 60 * MINUTE_MS),
  };
};

const getEmployeeTeam = async (employeeId) => {
  const employee = await User.findOne({
    _id: employeeId,
    role: "employee",
    isVerified: true,
  });

  if (!employee) {
    throw new Error("Verified employee not found");
  }

  if (!employee.teamId) {
    throw new Error("You are not assigned to a team");
  }

  const team = await Team.findOne({
    _id: employee.teamId,
    isActive: true,
  });

  if (!team) {
    throw new Error("Your team was not found or is inactive");
  }

  return { employee, team };
};

const assertManagerOwnsTeam = async (managerId, teamId) => {
  const manager = await User.findOne({
    _id: managerId,
    role: "manager",
  });

  if (!manager) {
    throw new Error("Manager not found");
  }

  const team = await Team.findOne({
    _id: teamId,
    isActive: true,
  });

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.managerId.toString() !== manager._id.toString()) {
    throw new Error(
      "You are not authorized to approve requests for this team",
    );
  }

  if (
    !manager.departmentId ||
    team.departmentId.toString() !== manager.departmentId.toString()
  ) {
    throw new Error("Team does not belong to your department");
  }

  return { manager, team };
};

export const requestExtraWorkService = async (employeeId, reason) => {
  if (
    typeof reason !== "string" ||
    reason.trim().length < 3 ||
    reason.trim().length > 500
  ) {
    throw new Error("Please provide a reason between 3 and 500 characters");
  }

  const now = new Date();
  const { employee, team } = await getEmployeeTeam(employeeId);
  const { start, end } = getShiftWindow(team, now);

  if (now >= start && now < end) {
    throw new Error(
      "You are inside your scheduled shift. Use normal Check In instead.",
    );
  }

  // Finalize any overdue session before deciding whether another can be requested.
  await finishExpiredExtraWorkSessionsService(now);

  const pending = await ExtraWorkRequest.findOne({
    employeeId: employee._id,
    status: "PENDING",
  });

  if (pending) {
    throw new Error("You already have a pending extra-work request");
  }

  const activeSession = await ExtraWorkRequest.findOne({
    employeeId: employee._id,
    status: "APPROVED",
    actualEndAt: null,
  });

  if (activeSession) {
    throw new Error("You already have an active extra-work session");
  }

  const request = await ExtraWorkRequest.create({
    employeeId: employee._id,
    teamId: team._id,
    attendanceDate: getISTMidnight(now),
    employeeReason: reason.trim(),
    requestedAt: now,
    status: "PENDING",
  });

  try {
    await createNotificationService({
      recipientId: team.managerId,
      type: "EXTRA_WORK_REQUEST",
      title: "Extra-work approval requested",
      message: `${employee.name} requested permission to work outside the scheduled shift for team ${team.name}.`,
      relatedId: request._id,
    });
  } catch (error) {
    // Keep the request even if real-time notification delivery fails.
    console.error("Could not create extra-work notification:", error.message);
  }

  return request;
};

export const getMyExtraWorkRequestsService = async (employeeId) => {
  return ExtraWorkRequest.find({ employeeId })
    .sort({ requestedAt: -1 })
    .populate("teamId", "name checkInTime checkOutTime")
    .populate("approvedBy", "name email");
};

export const getPendingExtraWorkRequestsService = async (managerId) => {
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
    teamId: { $in: teams.map((team) => team._id) },
    status: "PENDING",
  })
    .sort({ requestedAt: 1 })
    .populate("employeeId", "name email designation department")
    .populate("teamId", "name checkInTime checkOutTime");
};

export const decideExtraWorkRequestService = async (
  managerId,
  requestId,
  decision,
  data = {},
) => {
  if (!mongoose.isValidObjectId(requestId)) {
    throw new Error("Invalid extra-work request ID");
  }

  if (!["approve", "reject"].includes(decision)) {
    throw new Error("Invalid request decision");
  }

  const request = await ExtraWorkRequest.findById(requestId);

  if (!request) {
    throw new Error("Extra-work request not found");
  }

  const { manager } = await assertManagerOwnsTeam(
    managerId,
    request.teamId,
  );

  if (request.status !== "PENDING") {
    throw new Error("This request has already been processed");
  }

  const managerReason =
    typeof data.managerReason === "string"
      ? data.managerReason.trim()
      : "";

  if (managerReason.length < 3 || managerReason.length > 500) {
    throw new Error("Manager reason must contain 3 to 500 characters");
  }

  request.approvedBy = manager._id;
  request.managerReason = managerReason;
  request.decisionAt = new Date();

  if (decision === "reject") {
    request.status = "REJECTED";
    await request.save();

    try {
      await createNotificationService({
        recipientId: request.employeeId,
        type: "EXTRA_WORK_REJECTED",
        title: "Extra-work request rejected",
        message: `Your extra-work request was rejected. Reason: ${managerReason}`,
        relatedId: request._id,
      });
    } catch (error) {
      console.error("Could not notify employee:", error.message);
    }

    return request;
  }

  const duration = Number(data.approvedDurationMinutes);

  if (
    !Number.isInteger(duration) ||
    duration < 1 ||
    duration > MAX_APPROVED_MINUTES
  ) {
    throw new Error(
      "Approved duration must be between 1 minute and 12 hours",
    );
  }

  // Approval starts the session now; it never fabricates an earlier check-in.
  const now = new Date();
  const approvedEndAt = new Date(now.getTime() + duration * MINUTE_MS);

  request.status = "APPROVED";
  request.approvedDurationMinutes = duration;
  request.actualStartAt = now;
  request.approvedEndAt = approvedEndAt;
  request.actualEndAt = null;
  request.actualExtraMinutes = 0;

  await request.save();

  try {
    await createNotificationService({
      recipientId: request.employeeId,
      type: "EXTRA_WORK_APPROVED",
      title: "Extra-work request approved",
      message: `Your extra-work request was approved for ${duration} minutes. Your session started at approval time and is scheduled to end at ${approvedEndAt.toLocaleString("en-IN", { timeZone: TIME_ZONE })}.`,
      relatedId: request._id,
    });
  } catch (error) {
    console.error("Could not notify employee:", error.message);
  }

  return request;
};

export const finishExpiredExtraWorkSessionsService = async (
  now = new Date(),
) => {
  const expiredSessions = await ExtraWorkRequest.find({
    status: "APPROVED",
    actualEndAt: null,
    approvedEndAt: { $lte: now },
  });

  for (const session of expiredSessions) {
    // Use the approved deadline, not the later scheduler execution time.
    const actualEndAt = session.approvedEndAt;
    const actualExtraMinutes = Math.max(
      0,
      Math.floor(
        (actualEndAt.getTime() - session.actualStartAt.getTime()) /
          MINUTE_MS,
      ),
    );

    // The conditional update prevents duplicate completion by concurrent jobs.
    const updated = await ExtraWorkRequest.findOneAndUpdate(
      {
        _id: session._id,
        status: "APPROVED",
        actualEndAt: null,
      },
      {
        $set: {
          actualEndAt,
          actualExtraMinutes,
          status: "COMPLETED",
          autoCheckedOut: true,
        },
      },
      { new: true },
    );

    if (!updated) {
      continue;
    }

    try {
      await createNotificationService({
        recipientId: updated.employeeId,
        type: "EXTRA_WORK_COMPLETED",
        title: "Extra-work session completed",
        message: `Your extra-work session ended automatically. Recorded extra time: ${Math.floor(actualExtraMinutes / 60)}h ${actualExtraMinutes % 60}m.`,
        relatedId: updated._id,
      });
    } catch (error) {
      console.error("Could not notify employee:", error.message);
    }
  }
};

export const checkOutExtraWorkService = async (
  employeeId,
  requestId,
) => {
  if (!mongoose.isValidObjectId(requestId)) {
    throw new Error("Invalid extra-work request ID");
  }

  const session = await ExtraWorkRequest.findOne({
    _id: requestId,
    employeeId,
    status: "APPROVED",
    actualEndAt: null,
  });

  if (!session) {
    throw new Error("Active extra-work session not found");
  }

  const now = new Date();
  const actualEndAt =
    now < session.approvedEndAt ? now : session.approvedEndAt;

  const actualExtraMinutes = Math.max(
    0,
    Math.floor(
      (actualEndAt.getTime() - session.actualStartAt.getTime()) /
        MINUTE_MS,
    ),
  );

  session.actualEndAt = actualEndAt;
  session.actualExtraMinutes = actualExtraMinutes;
  session.status = "COMPLETED";
  session.autoCheckedOut = now >= session.approvedEndAt;

  await session.save();
  return session;
};

export const getExtraTimeSummaryService = async (employeeId) => {
  const sessions = await ExtraWorkRequest.find({
    employeeId,
    status: "COMPLETED",
  }).select("attendanceDate actualExtraMinutes");

  const summary = {};

  for (const session of sessions) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(session.attendanceDate);

    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value]),
    );

    const key = `${values.year}-${values.month}-${values.day}`;

    summary[key] =
      (summary[key] || 0) + (session.actualExtraMinutes || 0);
  }

  return summary;
};

export const getAllExtraWorkRecordsService = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "COMPLETED",
      "EXPIRED",
    ];

    if (!allowedStatuses.includes(filters.status)) {
      throw new Error("Invalid extra-work status");
    }

    query.status = filters.status;
  }

  if (filters.teamId) {
    if (!mongoose.isValidObjectId(filters.teamId)) {
      throw new Error("Invalid team ID");
    }

    query.teamId = filters.teamId;
  }

  if (filters.managerId) {
    if (!mongoose.isValidObjectId(filters.managerId)) {
      throw new Error("Invalid manager ID");
    }

    const teams = await Team.find({
      managerId: filters.managerId,
    }).select("_id");

    query.teamId = {
      $in: teams.map((team) => team._id),
    };

    if (filters.teamId) {
      query.teamId = {
        $in: teams
          .filter((team) => team._id.toString() === filters.teamId)
          .map((team) => team._id),
      };
    }
  }

  if (filters.from || filters.to) {
    query.requestedAt = {};

    if (filters.from) {
      const from = new Date(`${filters.from}T00:00:00+05:30`);

      if (Number.isNaN(from.getTime())) {
        throw new Error("Invalid start date");
      }

      query.requestedAt.$gte = from;
    }

    if (filters.to) {
      const to = new Date(`${filters.to}T23:59:59.999+05:30`);

      if (Number.isNaN(to.getTime())) {
        throw new Error("Invalid end date");
      }

      query.requestedAt.$lte = to;
    }

    if (
      query.requestedAt.$gte &&
      query.requestedAt.$lte &&
      query.requestedAt.$gte > query.requestedAt.$lte
    ) {
      throw new Error("Start date cannot be after end date");
    }
  }

  return ExtraWorkRequest.find(query)
    .sort({ requestedAt: -1 })
    .populate("employeeId", "name email designation departmentId")
    .populate("teamId", "name departmentId managerId")
    .populate("approvedBy", "name email role")
    .populate({
      path: "teamId",
      select: "name departmentId managerId",
      populate: {
        path: "managerId",
        select: "name email",
      },
    })
    .lean();
};