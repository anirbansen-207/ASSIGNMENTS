
import LeaveRequest from "../models/LeaveRequest.js";
import DepartmentLeavePolicy from "../models/DepartmentLeavePolicy.js";
import Department from "../models/Department.js";
import User from "../models/User.js";
import Team from "../models/Team.js";

import {
  createLeaveValidation,
  reviewLeaveValidation,
  departmentLeavePolicyValidation,
} from "../validations/leaveValidations.js";

import { createNotificationService } from "./notificationServices.js";

const TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET_MINUTES = 330;

// Converts a date into its calendar date in the Indian time zone.
const getISTDateParts = (date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const result = {};

  parts.forEach((part) => {
    if (["year", "month", "day"].includes(part.type)) {
      result[part.type] = Number(part.value);
    }
  });

  return result;
};

// Removes the time component and returns the date at IST midnight.
const getDateOnly = (date) => {
  const selectedDate = new Date(date);

  if (Number.isNaN(selectedDate.getTime())) {
    throw new Error("Invalid date");
  }

  const { year, month, day } = getISTDateParts(selectedDate);

  return new Date(
    Date.UTC(year, month - 1, day) -
      IST_OFFSET_MINUTES * 60 * 1000,
  );
};

// Calculates leave days inclusively, including both start and end dates.
const calculateLeaveDays = (startDate, endDate) => {
  const start = getDateOnly(startDate);
  const end = getDateOnly(endDate);

  const difference = end.getTime() - start.getTime();

  return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
};

// Validates the employee and resolves their reporting manager through the team.
const getEmployeeManager = async (employeeId) => {
  const employee = await User.findById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (employee.role !== "employee") {
    throw new Error("Only employees can apply for leave");
  }

  if (!employee.isVerified) {
    throw new Error("Employee account is not verified");
  }

  if (!employee.teamId) {
    throw new Error("Employee is not assigned to any team");
  }

  const team = await Team.findOne({
    _id: employee.teamId,
    isActive: true,
  });

  if (!team) {
    throw new Error("Employee team not found");
  }

  if (!team.managerId) {
    throw new Error("Employee does not have a manager");
  }

  return {
    employee,
    team,
    managerId: team.managerId,
  };
};

// Resolves the employee's department, using their team when necessary.
const getEmployeeDepartmentId = async (employee) => {
  if (employee.departmentId) {
    return employee.departmentId;
  }

  if (employee.teamId) {
    const team = await Team.findById(employee.teamId).select(
      "departmentId",
    );

    if (team?.departmentId) {
      return team.departmentId;
    }
  }

  throw new Error("Employee is not assigned to a department");
};

// Retrieves the leave policy configured for the employee's department.
const getDepartmentPolicy = async (departmentId) => {
  const policy = await DepartmentLeavePolicy.findOne({
    departmentId,
  });

  if (!policy) {
    throw new Error(
      "No department leave policy has been configured. Please contact your administrator.",
    );
  }

  return policy;
};

// Finds the configured allowance for a particular leave type.
const getPolicyLeaveType = (policy, leaveType) => {
  return policy.leaveTypes.find(
    (item) => item.leaveType === leaveType,
  );
};

// Returns the start and end dates of a calendar year.
const getYearRange = (year) => {
  const startDate = getDateOnly(
    new Date(`${year}-01-01T12:00:00.000Z`),
  );

  const endDate = getDateOnly(
    new Date(`${year}-12-31T12:00:00.000Z`),
  );

  return { startDate, endDate };
};

// Calculates approved leave days used by an employee in a given year.
// If a leave crosses a year boundary, only the days within that year count.
const getApprovedUsedDays = async ({
  employeeId,
  leaveType,
  year = new Date().getFullYear(),
}) => {
  const { startDate: yearStart, endDate: yearEnd } =
    getYearRange(year);

  const leaves = await LeaveRequest.find({
    employeeId,
    leaveType,
    status: "APPROVED",
    startDate: { $lte: yearEnd },
    endDate: { $gte: yearStart },
  }).select("startDate endDate totalDays");

  let usedDays = 0;

  for (const leave of leaves) {
    const leaveStart = getDateOnly(leave.startDate);
    const leaveEnd = getDateOnly(leave.endDate);

    const effectiveStart =
      leaveStart < yearStart ? yearStart : leaveStart;

    const effectiveEnd =
      leaveEnd > yearEnd ? yearEnd : leaveEnd;

    if (effectiveEnd >= effectiveStart) {
      usedDays += calculateLeaveDays(effectiveStart, effectiveEnd);
    }
  }

  return usedDays;
};

// Prevents overlapping pending or approved leave requests.
const checkLeaveOverlap = async ({
  employeeId,
  startDate,
  endDate,
  excludeLeaveId = null,
}) => {
  const query = {
    employeeId,
    status: {
      $in: ["PENDING", "APPROVED"],
    },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  };

  if (excludeLeaveId) {
    query._id = { $ne: excludeLeaveId };
  }

  return LeaveRequest.findOne(query);
};

// Calculates the employee's remaining allowance from the department policy.
// UNPAID leave remains unlimited, matching the existing service behavior.
const getRemainingLeaveDays = async ({
  employee,
  leaveType,
  year = new Date().getFullYear(),
}) => {
  if (leaveType === "UNPAID") {
    return {
      totalDays: null,
      usedDays: 0,
      remainingDays: null,
    };
  }

  const departmentId = await getEmployeeDepartmentId(employee);
  const policy = await getDepartmentPolicy(departmentId);
  const leavePolicy = getPolicyLeaveType(policy, leaveType);

  if (!leavePolicy) {
    throw new Error(
      `No ${leaveType} leave policy is configured for your department.`,
    );
  }

  const usedDays = await getApprovedUsedDays({
    employeeId: employee._id,
    leaveType,
    year,
  });

  return {
    totalDays: leavePolicy.totalDays,
    usedDays,
    remainingDays: Math.max(0, leavePolicy.totalDays - usedDays),
  };
};

// Employee submits a new leave request.
export const createLeaveService = async (data, employeeId) => {
  try {
    const { error } = createLeaveValidation.validate(data);

    if (error) {
      throw new Error(error.details[0].message);
    }

    const { employee, managerId } =
      await getEmployeeManager(employeeId);

    const startDate = getDateOnly(data.startDate);
    const endDate = getDateOnly(data.endDate);

    if (endDate < startDate) {
      throw new Error("End date cannot be before start date");
    }

    const totalDays = calculateLeaveDays(startDate, endDate);

    const overlappingLeave = await checkLeaveOverlap({
      employeeId: employee._id,
      startDate,
      endDate,
    });

    if (overlappingLeave) {
      throw new Error(
        "You already have a pending or approved leave for these dates",
      );
    }

    // Paid leave types must have a configured department policy and
    // sufficient allowance. UNPAID leave is not subject to an allowance.
    if (data.leaveType !== "UNPAID") {
      const { remainingDays } = await getRemainingLeaveDays({
        employee,
        leaveType: data.leaveType,
        year: getISTDateParts(startDate).year,
      });

      if (remainingDays < totalDays) {
        throw new Error(
          `Insufficient ${data.leaveType} leave balance. Remaining days: ${remainingDays}`,
        );
      }
    }

    const leave = await LeaveRequest.create({
      employeeId: employee._id,
      managerId,
      leaveType: data.leaveType,
      startDate,
      endDate,
      totalDays,
      reason: data.reason,
      status: "PENDING",
    });

    return leave;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Retrieves the logged-in employee's leave requests.
export const viewMyLeaveService = async (employeeId) => {
  try {
    const employee = await User.findById(employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    return LeaveRequest.find({
      employeeId: employee._id,
    })
      .populate("managerId", "name email designation")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Retrieves leave requests assigned to the logged-in manager.
export const viewTeamLeaveService = async (managerId) => {
  try {
    const manager = await User.findById(managerId);

    if (!manager) {
      throw new Error("Manager not found");
    }

    if (manager.role !== "manager") {
      throw new Error("Only managers can view team leave");
    }

    return LeaveRequest.find({
      managerId: manager._id,
    })
      .populate(
        "employeeId",
        "name email designation department departmentId teamId",
      )
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Manager approves or rejects a pending leave request.
export const reviewLeaveService = async (
  leaveId,
  data,
  managerId,
) => {
  try {
    const { error } = reviewLeaveValidation.validate(data);

    if (error) {
      throw new Error(error.details[0].message);
    }

    const manager = await User.findById(managerId);

    if (!manager) {
      throw new Error("Manager not found");
    }

    if (manager.role !== "manager") {
      throw new Error("Only managers can review leave");
    }

    const leave = await LeaveRequest.findById(leaveId);

    if (!leave) {
      throw new Error("Leave request not found");
    }

    if (leave.managerId.toString() !== manager._id.toString()) {
      throw new Error("You are not authorized to review this leave");
    }

    if (leave.status !== "PENDING") {
      throw new Error("Only pending leave requests can be reviewed");
    }

    if (data.status === "APPROVED") {
      if (leave.leaveType !== "UNPAID") {
        const employee = await User.findById(leave.employeeId);

        if (!employee) {
          throw new Error("Employee not found");
        }

        const year = getISTDateParts(leave.startDate).year;

        const { remainingDays } = await getRemainingLeaveDays({
          employee,
          leaveType: leave.leaveType,
          year,
        });

        if (remainingDays < leave.totalDays) {
          throw new Error(
            `Insufficient ${leave.leaveType} leave balance`,
          );
        }
      }

      leave.status = "APPROVED";
      leave.rejectionReason = null;
    } else {
      leave.status = "REJECTED";
      leave.rejectionReason = data.rejectionReason;
    }

    leave.reviewedBy = manager._id;
    leave.reviewedAt = new Date();

    await leave.save();

    // Notify the employee after the review has been saved.
    if (leave.status === "APPROVED") {
      await createNotificationService({
        recipientId: leave.employeeId,
        type: "LEAVE_APPROVED",
        title: "Leave Approved",
        message: `Your leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been approved.`,
        relatedId: leave._id,
      });
    }

    if (leave.status === "REJECTED") {
      await createNotificationService({
        recipientId: leave.employeeId,
        type: "LEAVE_REJECTED",
        title: "Leave Rejected",
        message: `Your leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been rejected.`,
        relatedId: leave._id,
      });
    }

    return leave;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Retrieves all leave requests for administrative views.
export const viewAllLeaveService = async () => {
  try {
    return LeaveRequest.find()
      .populate(
        "employeeId",
        "name email designation department departmentId teamId",
      )
      .populate("managerId", "name email designation")
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Builds the logged-in employee's leave balance from their department policy.
// No separate per-employee allowance is created.
export const viewMyLeaveBalanceService = async (employeeId) => {
  try {
    const employee = await User.findById(employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    const departmentId = await getEmployeeDepartmentId(employee);
    const policy = await getDepartmentPolicy(departmentId);
    const year = getISTDateParts(new Date()).year;

    const balances = await Promise.all(
      policy.leaveTypes.map(async (item) => {
        const usedDays =
          item.leaveType === "UNPAID"
            ? 0
            : await getApprovedUsedDays({
                employeeId: employee._id,
                leaveType: item.leaveType,
                year,
              });

        return {
          _id: `${policy._id}-${item.leaveType}`,
          employeeId: employee._id,
          departmentId,
          leaveType: item.leaveType,
          totalDays: item.totalDays,
          usedDays,
          remainingDays:
            item.leaveType === "UNPAID"
              ? null
              : Math.max(0, item.totalDays - usedDays),
          year,
        };
      }),
    );

    return balances;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Saves a department-level leave policy.
 *
 * Expected data:
 * {
 *   departmentId: "...",
 *   leaveTypes: [
 *     { leaveType: "CASUAL", totalDays: 12 },
 *     { leaveType: "SICK", totalDays: 10 }
 *   ]
 * }
 *
 * The existing /set-balance endpoint is retained for compatibility.
 */
export const setLeaveBalanceService = async (data, adminId) => {
  try {
    const admin = await User.findById(adminId);

    if (!admin) {
      throw new Error("Admin not found");
    }

    if (admin.role !== "admin") {
      throw new Error("Only admin can manage department leave policies");
    }

    // Validate department ID, leave types, allowance values, and duplicates.
    const { error } = departmentLeavePolicyValidation.validate(data);

    if (error) {
      throw new Error(error.details[0].message);
    }

    const department = await Department.findOne({
      _id: data.departmentId,
      isActive: true,
    });

    if (!department) {
      throw new Error("Active department not found");
    }

    // One policy is maintained per department. Saving again updates it.
    const policy = await DepartmentLeavePolicy.findOneAndUpdate(
      { departmentId: department._id },
      {
        $set: {
          departmentId: department._id,
          leaveTypes: data.leaveTypes.map((item) => ({
            leaveType: item.leaveType,
            totalDays: Number(item.totalDays),
          })),
          updatedBy: admin._id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return policy;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Retrieves approved leave requests for the organization calendar.
export const viewLeaveCalendarService = async () => {
  try {
    return LeaveRequest.find({
      status: "APPROVED",
    })
      .populate(
        "employeeId",
        "name email designation department departmentId teamId",
      )
      .sort({ startDate: 1 });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Retrieves approved leave requests assigned to a particular manager.
export const viewTeamLeaveCalendarService = async (managerId) => {
  try {
    const manager = await User.findById(managerId);

    if (!manager) {
      throw new Error("Manager not found");
    }

    if (manager.role !== "manager") {
      throw new Error("Only managers can view team leave calendar");
    }

    return LeaveRequest.find({
      managerId: manager._id,
      status: "APPROVED",
    })
      .populate(
        "employeeId",
        "name email designation department departmentId teamId",
      )
      .sort({ startDate: 1 });
  } catch (error) {
    throw new Error(error.message);
  }
};
