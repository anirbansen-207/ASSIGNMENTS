import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import LeaveRequest from "../models/LeaveRequest.js";

import { correctAttendanceValidation } from "../validations/attendanceValidation.js";

const TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET_MINUTES = 330;
const SHIFT_DURATION_MINUTES = 8 * 60;
const GRACE_PERIOD_MINUTES = 40;
const MAX_BREAK_MINUTES = 90;
const HALF_DAY_MINUTES = 4 * 60;
const MINUTE_MS = 60 * 1000;

// Convert a timestamp into calendar-date parts in Indian Standard Time.
const getISTDateParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const result = {};

  for (const part of parts) {
    if (["year", "month", "day"].includes(part.type)) {
      result[part.type] = Number(part.value);
    }
  }

  return result;
};

// Create midnight for a calendar date in IST.
const createISTMidnight = (year, month, day) => {
  return new Date(
    Date.UTC(year, month - 1, day, 0, 0, 0, 0) - IST_OFFSET_MINUTES * 60 * 1000,
  );
};

// Get today's date using the attendance system's IST convention.
const getTodayDate = () => {
  const { year, month, day } = getISTDateParts();
  return createISTMidnight(year, month, day);
};

// Normalize a date for attendance filtering and reject impossible dates.
const getDateOnly = (date) => {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    const normalizedDate = createISTMidnight(year, month, day);
    const normalizedParts = getISTDateParts(normalizedDate);

    if (
      normalizedParts.year !== year ||
      normalizedParts.month !== month ||
      normalizedParts.day !== day
    ) {
      throw new Error("Invalid attendance date");
    }

    return normalizedDate;
  }

  const selectedDate = new Date(date);

  if (Number.isNaN(selectedDate.getTime())) {
    throw new Error("Invalid attendance date");
  }

  const { year, month, day } = getISTDateParts(selectedDate);
  return createISTMidnight(year, month, day);
};

// Convert a team's configured HH:mm start time into an IST timestamp.
const getTeamCheckInDateTime = (checkInTime, attendanceDate) => {
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(checkInTime || "")) {
    throw new Error("Invalid team check-in time");
  }

  const [hours, minutes] = checkInTime.split(":").map(Number);
  const { year, month, day } = getISTDateParts(attendanceDate);

  return new Date(
    Date.UTC(year, month - 1, day, hours, minutes, 0, 0) -
      IST_OFFSET_MINUTES * 60 * 1000,
  );
};

// The scheduled shift lasts exactly eight hours, including the break.
const getTeamShiftEndTime = (checkInTime, attendanceDate) => {
  const shiftStart = getTeamCheckInDateTime(checkInTime, attendanceDate);

  return new Date(shiftStart.getTime() + SHIFT_DURATION_MINUTES * MINUTE_MS);
};

// The grace period ends 40 minutes after the scheduled start.
const getGracePeriodEndTime = (checkInTime, attendanceDate) => {
  const shiftStart = getTeamCheckInDateTime(checkInTime, attendanceDate);

  return new Date(shiftStart.getTime() + GRACE_PERIOD_MINUTES * MINUTE_MS);
};

// Find approved leave overlapping the selected attendance date.
const hasApprovedLeaveForDate = async (employeeId, attendanceDate) => {
  const nextDate = new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000);

  return LeaveRequest.findOne({
    employeeId,
    status: "APPROVED",
    startDate: { $lt: nextDate },
    endDate: { $gte: attendanceDate },
  });
};

// Build a read-only attendance row when no database record exists yet.
// A missing check-in is not marked ABSENT until that team's shift has ended.
const buildMissingAttendanceRecord = async (employee, team, attendanceDate) => {
  const approvedLeave = await hasApprovedLeaveForDate(
    employee._id,
    attendanceDate,
  );

  const shiftEnd = getTeamShiftEndTime(team.checkInTime, attendanceDate);

  const status = approvedLeave
    ? "ON_LEAVE"
    : new Date() >= shiftEnd
      ? "ABSENT"
      : "NOT_MARKED";

  return {
    employeeId: employee,
    attendanceDate,
    checkInAt: null,
    checkOutAt: null,
    breakUsed: false,
    breakStartedAt: null,
    breakEndedAt: null,
    breakDurationMinutes: 0,
    breakAutoEnded: false,
    isLate: false,
    lateMinutes: 0,
    totalWorkingMinutes: 0,
    requiresReview: false,
    reviewReason: null,
    status,
    correctionReason: null,
    correctedBy: null,
  };
};

// Load a verified employee and their active team.
const getEmployeeAndActiveTeam = async (employeeId) => {
  const employee = await User.findOne({
    _id: employeeId,
    role: "employee",
    isVerified: true,
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (!employee.teamId) {
    throw new Error("You are not assigned to any team");
  }

  const team = await Team.findOne({
    _id: employee.teamId,
    isActive: true,
  });

  if (!team) {
    throw new Error("Your team was not found or is inactive");
  }

  if (!team.checkInTime) {
    throw new Error("Check-in time is not configured for your team");
  }

  return { employee, team };
};

// Break expiry is the earlier of 90 minutes after break start or shift end.
const getEffectiveBreakEndTime = (attendance, shiftEndTime) => {
  if (!attendance.breakStartedAt) {
    return null;
  }

  const maximumBreakEnd = new Date(
    attendance.breakStartedAt.getTime() + MAX_BREAK_MINUTES * MINUTE_MS,
  );

  return maximumBreakEnd < shiftEndTime ? maximumBreakEnd : shiftEndTime;
};

// Close an expired break at its actual deadline, not when the scheduler runs.
const closeExpiredBreak = async (
  attendance,
  shiftEndTime,
  now = new Date(),
) => {
  if (
    !attendance?.breakUsed ||
    !attendance.breakStartedAt ||
    attendance.breakEndedAt
  ) {
    return false;
  }

  const effectiveEnd = getEffectiveBreakEndTime(attendance, shiftEndTime);

  if (!effectiveEnd || now < effectiveEnd) {
    return false;
  }

  attendance.breakEndedAt = effectiveEnd;
  attendance.breakDurationMinutes = Math.min(
    MAX_BREAK_MINUTES,
    Math.max(
      0,
      Math.floor(
        (effectiveEnd.getTime() - attendance.breakStartedAt.getTime()) /
          MINUTE_MS,
      ),
    ),
  );

  // True only when the 90-minute limit, rather than shift end,
  // determines the break's expiry time.
  attendance.breakAutoEnded =
    effectiveEnd.getTime() ===
    attendance.breakStartedAt.getTime() + MAX_BREAK_MINUTES * MINUTE_MS;

  await attendance.save();
  return true;
};
// Calculate working time inside the scheduled shift, deducting the break once.
const calculateWorkingMinutes = (
  attendance,
  shiftStartTime,
  shiftEndTime,
  now,
) => {
  if (!attendance.checkInAt) {
    return 0;
  }

  // Do not count time before the scheduled shift starts, even if the
  // employee checks in early. Late check-ins naturally start later.
  const effectiveStart = new Date(
    Math.max(attendance.checkInAt.getTime(), shiftStartTime.getTime()),
  );

  const effectiveEnd = new Date(
    Math.min((attendance.checkOutAt || now).getTime(), shiftEndTime.getTime()),
  );

  if (effectiveEnd <= effectiveStart) {
    return 0;
  }

  const elapsedMinutes = Math.floor(
    (effectiveEnd.getTime() - effectiveStart.getTime()) / MINUTE_MS,
  );

  let breakMinutes = Number(attendance.breakDurationMinutes) || 0;

  if (attendance.breakStartedAt) {
    const effectiveBreakEnd = getEffectiveBreakEndTime(
      attendance,
      shiftEndTime,
    );

    const actualBreakEnd = attendance.breakEndedAt
      ? new Date(
          Math.min(
            attendance.breakEndedAt.getTime(),
            effectiveBreakEnd.getTime(),
          ),
        )
      : new Date(Math.min(now.getTime(), effectiveBreakEnd.getTime()));

    // Calculate the portion of the break that overlaps the recorded
    // working interval. This avoids deducting time outside the shift.
    const breakStart = new Date(
      Math.max(attendance.breakStartedAt.getTime(), effectiveStart.getTime()),
    );

    const breakEnd = new Date(
      Math.min(actualBreakEnd.getTime(), effectiveEnd.getTime()),
    );

    const actualBreakMinutes =
      breakEnd > breakStart
        ? Math.floor((breakEnd.getTime() - breakStart.getTime()) / MINUTE_MS)
        : 0;

    breakMinutes = Math.min(MAX_BREAK_MINUTES, Math.max(0, actualBreakMinutes));
  }

  return Math.max(
    0,
    Math.min(SHIFT_DURATION_MINUTES, elapsedMinutes - breakMinutes),
  );
};

// Determine the final status after checkout.
// Lateness is retained separately so a half-day can also be late.
const updateAttendanceStatus = (attendance) => {
  if (attendance.totalWorkingMinutes < HALF_DAY_MINUTES) {
    attendance.status = "HALF_DAY";
    return;
  }

  attendance.status = attendance.isLate ? "LATE" : "PRESENT";
};

// Employee checks in once during the scheduled shift.
export const checkInService = async (employeeId) => {
  const now = new Date();
  const attendanceDate = getTodayDate();

  const { employee, team } = await getEmployeeAndActiveTeam(employeeId);

  const approvedLeave = await hasApprovedLeaveForDate(
    employee._id,
    attendanceDate,
  );

  if (approvedLeave) {
    throw new Error("You are on approved leave today");
  }

  const existingAttendance = await Attendance.findOne({
    employeeId: employee._id,
    attendanceDate,
  });

  if (existingAttendance) {
    if (existingAttendance.status === "ABSENT") {
      throw new Error(
        "You have already been marked absent for today. Contact your manager or admin.",
      );
    }

    throw new Error("Attendance already exists for today");
  }

  const shiftStart = getTeamCheckInDateTime(team.checkInTime, attendanceDate);

  const graceEnd = getGracePeriodEndTime(team.checkInTime, attendanceDate);

  const shiftEnd = getTeamShiftEndTime(team.checkInTime, attendanceDate);

  // A check-in before the scheduled start requires manager approval.
  if (now < shiftStart) {
    throw new Error(
      "You are outside your scheduled shift. Request manager approval to work now.",
    );
  }

  if (now >= shiftEnd) {
    // Upsert avoids creating a duplicate no-show record if the scheduler
    // has already recorded the employee's absence.
    await Attendance.findOneAndUpdate(
      {
        employeeId: employee._id,
        attendanceDate,
      },
      {
        $setOnInsert: {
          employeeId: employee._id,
          attendanceDate,
          checkInAt: null,
          checkOutAt: null,
          totalWorkingMinutes: 0,
          breakUsed: false,
          breakStartedAt: null,
          breakEndedAt: null,
          breakDurationMinutes: 0,
          breakAutoEnded: false,
          isLate: false,
          lateMinutes: 0,
          requiresReview: false,
          reviewReason: null,
          status: "ABSENT",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    throw new Error(
      "The scheduled shift has ended. You cannot check in for this shift.",
    );
  }

  // The grace period is measured from the configured shift start.
  const isLate = now > graceEnd;

  const lateMinutes = isLate
    ? Math.max(1, Math.ceil((now.getTime() - graceEnd.getTime()) / MINUTE_MS))
    : 0;

  try {
    return await Attendance.create({
      employeeId: employee._id,
      attendanceDate,
      checkInAt: now,
      checkOutAt: null,
      breakUsed: false,
      breakStartedAt: null,
      breakEndedAt: null,
      breakDurationMinutes: 0,
      breakAutoEnded: false,
      isLate,
      lateMinutes,
      totalWorkingMinutes: 0,
      requiresReview: false,
      reviewReason: null,
      status: isLate ? "LATE" : "PRESENT",
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Attendance already exists for today");
    }

    throw error;
  }
};

// Employee starts their one permitted break for the current shift.
export const startBreakService = async (employeeId) => {
  const now = new Date();
  const attendanceDate = getTodayDate();

  const { employee, team } = await getEmployeeAndActiveTeam(employeeId);

  const attendance = await Attendance.findOne({
    employeeId: employee._id,
    attendanceDate,
  });

  if (!attendance || !attendance.checkInAt) {
    throw new Error("You must check in before starting a break");
  }

  if (attendance.checkOutAt) {
    throw new Error("You have already checked out");
  }

  if (attendance.status === "ABSENT" || attendance.status === "ON_LEAVE") {
    throw new Error("You cannot start a break for this attendance record");
  }

  const shiftStart = getTeamCheckInDateTime(team.checkInTime, attendanceDate);

  const shiftEnd = getTeamShiftEndTime(team.checkInTime, attendanceDate);

  // Breaks can only be taken inside the employee's scheduled shift.
  if (now < shiftStart) {
    throw new Error(
      "You cannot start a break before your scheduled shift begins",
    );
  }

  if (now >= shiftEnd) {
    throw new Error("The scheduled shift has ended");
  }

  await closeExpiredBreak(attendance, shiftEnd, now);

  if (attendance.breakUsed) {
    throw new Error("You have already used your break for this shift");
  }

  // Atomically claim the single permitted break to prevent concurrent
  // requests from starting multiple breaks.
  const updatedAttendance = await Attendance.findOneAndUpdate(
    {
      _id: attendance._id,
      breakUsed: { $ne: true },
      checkOutAt: null,
    },
    {
      $set: {
        breakUsed: true,
        breakStartedAt: now,
        breakEndedAt: null,
        breakDurationMinutes: 0,
        breakAutoEnded: false,
      },
    },
    { new: true },
  );

  if (!updatedAttendance) {
    throw new Error("You have already used your break for this shift");
  }

  return updatedAttendance;
};
// Employee can return early. An expired break is finalized at its deadline.
export const endBreakService = async (employeeId) => {
  const now = new Date();
  const attendanceDate = getTodayDate();

  const { employee, team } = await getEmployeeAndActiveTeam(employeeId);

  const attendance = await Attendance.findOne({
    employeeId: employee._id,
    attendanceDate,
  });

  if (!attendance || !attendance.checkInAt) {
    throw new Error("Attendance record not found");
  }

  if (attendance.checkOutAt) {
    throw new Error("You have already checked out");
  }

  if (!attendance.breakUsed || !attendance.breakStartedAt) {
    throw new Error("You have not started a break");
  }

  const shiftEnd = getTeamShiftEndTime(team.checkInTime, attendanceDate);

  const expired = await closeExpiredBreak(attendance, shiftEnd, now);

  if (expired) {
    return attendance;
  }

  if (attendance.breakEndedAt) {
    throw new Error("Your break has already ended");
  }

  attendance.breakEndedAt = now;
  attendance.breakDurationMinutes = Math.min(
    MAX_BREAK_MINUTES,
    Math.max(
      0,
      Math.floor(
        (now.getTime() - attendance.breakStartedAt.getTime()) / MINUTE_MS,
      ),
    ),
  );
  attendance.breakAutoEnded = false;

  await attendance.save();
  return attendance;
};

// Employee checks out. A break must end first unless it has expired.
export const checkOutService = async (employeeId) => {
  const now = new Date();
  const attendanceDate = getTodayDate();

  const { employee, team } = await getEmployeeAndActiveTeam(employeeId);

  const attendance = await Attendance.findOne({
    employeeId: employee._id,
    attendanceDate,
  });

  if (!attendance) {
    throw new Error("You have not checked in today");
  }

  if (attendance.status === "ABSENT") {
    throw new Error("Absent employees cannot check out");
  }

  if (attendance.status === "ON_LEAVE") {
    throw new Error("Employees on leave cannot check out");
  }

  if (!attendance.checkInAt) {
    throw new Error("Check-in record not found");
  }

  if (attendance.checkOutAt) {
    throw new Error("You have already checked out");
  }

  const shiftStart = getTeamCheckInDateTime(team.checkInTime, attendanceDate);

  const shiftEnd = getTeamShiftEndTime(team.checkInTime, attendanceDate);

  await closeExpiredBreak(attendance, shiftEnd, now);

  if (attendance.breakStartedAt && !attendance.breakEndedAt) {
    throw new Error("Please end your break before checking out");
  }

  // Keep the actual checkout timestamp. Working time is capped at shift end.
  attendance.checkOutAt = now;

  attendance.totalWorkingMinutes = calculateWorkingMinutes(
    attendance,
    shiftStart,
    shiftEnd,
    now,
  );

  updateAttendanceStatus(attendance);

  if (attendance.totalWorkingMinutes < HALF_DAY_MINUTES) {
    attendance.requiresReview = true;
    attendance.reviewReason = "Working time was less than four hours";
  }

  await attendance.save();
  return attendance;
};

// Employee views their own attendance history.
export const viewMyAttendanceService = async (employeeId) => {
  const employee = await User.findOne({
    _id: employeeId,
    role: "employee",
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  return Attendance.find({
    employeeId: employee._id,
  }).sort({ attendanceDate: -1 });
};

// Verify the manager's access to a specific active team.
const getManagerAndTeam = async (managerId, teamId) => {
  const manager = await User.findOne({
    _id: managerId,
    role: "manager",
  });

  if (!manager) {
    throw new Error("Manager not found");
  }

  if (!manager.departmentId) {
    throw new Error("Manager is not assigned to a department");
  }

  const team = await Team.findOne({
    _id: teamId,
    isActive: true,
  });

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.managerId.toString() !== manager._id.toString()) {
    throw new Error("You are not authorized to view this team's attendance");
  }

  if (team.departmentId.toString() !== manager.departmentId.toString()) {
    throw new Error("Team does not belong to your department");
  }

  return { manager, team };
};

// Get verified employees assigned to a team.
const getTeamEmployees = async (team) => {
  return User.find({
    role: "employee",
    isVerified: true,
    teamId: team._id,
    departmentId: team.departmentId,
  }).select("name email designation department departmentId teamId");
};

// Manager views recorded attendance for their team.
export const viewTeamAttendanceService = async (managerId, teamId) => {
  const { team } = await getManagerAndTeam(managerId, teamId);
  const employees = await getTeamEmployees(team);

  return Attendance.find({
    employeeId: { $in: employees.map((employee) => employee._id) },
  })
    .populate("employeeId", "name email designation department")
    .sort({ attendanceDate: -1 });
};

// Manager views a team's attendance for one date, including employees
// who do not yet have a saved attendance record.
export const viewTeamAttendanceByDateService = async (
  managerId,
  teamId,
  date,
) => {
  const { team } = await getManagerAndTeam(managerId, teamId);
  const attendanceDate = getDateOnly(date);
  const employees = await getTeamEmployees(team);

  const records = await Attendance.find({
    employeeId: { $in: employees.map((employee) => employee._id) },
    attendanceDate,
  }).populate("employeeId", "name email designation department");

  const attendanceMap = new Map();

  records.forEach((record) => {
    attendanceMap.set(record.employeeId._id.toString(), record);
  });

  return Promise.all(
    employees.map(async (employee) => {
      const existingAttendance = attendanceMap.get(employee._id.toString());

      if (existingAttendance) {
        return existingAttendance;
      }

      return buildMissingAttendanceRecord(employee, team, attendanceDate);
    }),
  );
};
// Admin views all saved attendance records.
export const viewAllAttendanceService = async () => {
  return Attendance.find({})
    .populate("employeeId", "name email designation department")
    .populate("correctedBy", "name email role")
    .sort({ attendanceDate: -1 });
};

// Admin views attendance for a selected date.
export const viewAllAttendanceByDateService = async (date) => {
  const attendanceDate = getDateOnly(date);

  return Attendance.find({ attendanceDate })
    .populate("employeeId", "name email designation department")
    .populate("correctedBy", "name email role")
    .sort({ createdAt: 1 });
};

// Admin filters attendance by date and team.
export const viewAttendanceByDateAndTeamService = async (date, teamId) => {
  const team = await Team.findOne({
    _id: teamId,
    isActive: true,
  });

  if (!team) {
    throw new Error("Team not found");
  }

  const attendanceDate = getDateOnly(date);
  const employees = await getTeamEmployees(team);

  const records = await Attendance.find({
    employeeId: { $in: employees.map((employee) => employee._id) },
    attendanceDate,
  })
    .populate("employeeId", "name email designation department")
    .populate("correctedBy", "name email role");

  const attendanceMap = new Map();

  records.forEach((record) => {
    attendanceMap.set(record.employeeId._id.toString(), record);
  });

  return Promise.all(
    employees.map(async (employee) => {
      const existingAttendance = attendanceMap.get(employee._id.toString());

      if (existingAttendance) {
        return existingAttendance;
      }

      return buildMissingAttendanceRecord(employee, team, attendanceDate);
    }),
  );
};

// Background job: close expired breaks, finalize missing checkouts,
// and mark employees without check-ins absent at shift end.
export const markAutomaticAbsenceService = async () => {
  const now = new Date();
  const attendanceDate = getTodayDate();

  const teams = await Team.find({
    isActive: true,
    checkInTime: { $exists: true, $ne: null },
  });

  for (const team of teams) {
    const shiftStart = getTeamCheckInDateTime(team.checkInTime, attendanceDate);

    const shiftEnd = getTeamShiftEndTime(team.checkInTime, attendanceDate);

    const employees = await User.find({
      role: "employee",
      isVerified: true,
      teamId: team._id,
      departmentId: team.departmentId,
    }).select("_id");

    for (const employee of employees) {
      const attendance = await Attendance.findOne({
        employeeId: employee._id,
        attendanceDate,
      });

      if (attendance) {
        if (attendance.breakStartedAt && !attendance.breakEndedAt) {
          await closeExpiredBreak(attendance, shiftEnd, now);
        }

        // At shift end, calculate final working time for an employee
        // who checked in but did not record checkout.
        if (now >= shiftEnd && attendance.checkInAt && !attendance.checkOutAt) {
          attendance.totalWorkingMinutes = calculateWorkingMinutes(
            attendance,
            shiftStart,
            shiftEnd,
            now,
          );

          updateAttendanceStatus(attendance);
          attendance.requiresReview = true;

          if (!attendance.reviewReason) {
            attendance.reviewReason =
              "No checkout was recorded by the scheduled shift end.";
          }

          await attendance.save();
        }

        continue;
      }

      // Do not mark someone absent before their scheduled shift ends.
      if (now < shiftEnd) {
        continue;
      }

      const approvedLeave = await hasApprovedLeaveForDate(
        employee._id,
        attendanceDate,
      );

      // Use an upsert to avoid duplicate employee/date records when
      // the scheduler runs more than once.
      await Attendance.findOneAndUpdate(
        {
          employeeId: employee._id,
          attendanceDate,
        },
        {
          $setOnInsert: {
            employeeId: employee._id,
            attendanceDate,
            checkInAt: null,
            checkOutAt: null,
            totalWorkingMinutes: 0,
            breakUsed: false,
            breakStartedAt: null,
            breakEndedAt: null,
            breakDurationMinutes: 0,
            breakAutoEnded: false,
            isLate: false,
            lateMinutes: 0,
            requiresReview: false,
            reviewReason: null,
            status: approvedLeave ? "ON_LEAVE" : "ABSENT",
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }
  }
};

// Admin corrects an existing attendance record.
export const correctAttendanceService = async (attendanceId, data, adminId) => {
  const { error } = correctAttendanceValidation.validate(data);

  if (error) {
    throw new Error(error.details[0].message);
  }

  const admin = await User.findOne({
    _id: adminId,
    role: "admin",
  });

  if (!admin) {
    throw new Error("Admin not found");
  }

  const attendance = await Attendance.findById(attendanceId);

  if (!attendance) {
    throw new Error("Attendance record not found");
  }

  attendance.status = data.status;
  attendance.correctionReason = data.correctionReason;
  attendance.correctedBy = admin._id;

  await attendance.save();
  return attendance;
};
