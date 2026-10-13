
import User from "../models/User.js";
import Department from "../models/Department.js";
import Team from "../models/Team.js";
import Task from "../models/taskModel.js";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";

// Calculate average progress for the same active tasks used by analytics.
// Missing progress values are treated as 0.
const getAverageTaskProgress = async (filter = {}) => {
  const [result] = await Task.aggregate([
    {
      $match: {
        ...filter,
        isActive: true,
      },
    },
    {
      $group: {
        _id: null,
        averageProgress: {
          $avg: {
            $ifNull: ["$progress", 0],
          },
        },
      },
    },
  ]);

  return Math.round(result?.averageProgress || 0);
};

export const getAnalyticsOverviewService = async (user) => {
  try {
    if (user.role === "admin") {
      return await getAdminAnalytics();
    }

    if (user.role === "manager") {
      return await getManagerAnalytics(user._id);
    }

    if (user.role === "employee") {
      return await getEmployeeAnalytics(user._id);
    }

    throw new Error("You are not allowed to view analytics");
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAdminAnalytics = async () => {
  const [
    totalEmployees,
    totalManagers,
    totalDepartments,
    totalTeams,
    totalTasks,
    completedTasks,
    inProgressTasks,
    blockedTasks,
    pendingTasks,
    presentAttendance,
    lateAttendance,
    absentAttendance,
    halfDayAttendance,
    onLeaveAttendance,
    pendingLeaves,
    approvedLeaves,
    rejectedLeaves,
  ] = await Promise.all([
    User.countDocuments({
      role: "employee",
      isVerified: true,
    }),

    User.countDocuments({
      role: "manager",
      isVerified: true,
    }),

    Department.countDocuments({
      isActive: true,
    }),

    Team.countDocuments({
      isActive: true,
    }),

    Task.countDocuments({
      isActive: true,
    }),

    Task.countDocuments({
      isActive: true,
      status: "COMPLETED",
    }),

    Task.countDocuments({
      isActive: true,
      status: "IN_PROGRESS",
    }),

    Task.countDocuments({
      isActive: true,
      status: "BLOCKED",
    }),

    Task.countDocuments({
      isActive: true,
      status: {
        $in: [
          "ASSIGNED",
          "ACCEPTED",
          "IN_REVIEW",
          "REWORK_REQUIRED",
        ],
      },
    }),

    Attendance.countDocuments({
      status: "PRESENT",
    }),

    Attendance.countDocuments({
      status: "LATE",
    }),

    Attendance.countDocuments({
      status: "ABSENT",
    }),

    Attendance.countDocuments({
      status: "HALF_DAY",
    }),

    Attendance.countDocuments({
      status: "ON_LEAVE",
    }),

    LeaveRequest.countDocuments({
      status: "PENDING",
    }),

    LeaveRequest.countDocuments({
      status: "APPROVED",
    }),

    LeaveRequest.countDocuments({
      status: "REJECTED",
    }),
  ]);

  const averageProgress = await getAverageTaskProgress();

  return {
    role: "admin",

    users: {
      totalEmployees,
      totalManagers,
    },

    organization: {
      totalDepartments,
      totalTeams,
    },

    tasks: {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      blocked: blockedTasks,
      pending: pendingTasks,
      averageProgress,
    },

    attendance: {
      present: presentAttendance,
      late: lateAttendance,
      halfDay: halfDayAttendance,
      absent: absentAttendance,
      onLeave: onLeaveAttendance,
    },

    leave: {
      pending: pendingLeaves,
      approved: approvedLeaves,
      rejected: rejectedLeaves,
    },
  };
};

const getManagerAnalytics = async (managerId) => {
  const manager = await User.findById(managerId);

  if (!manager) {
    throw new Error("Manager not found");
  }

  if (manager.role !== "manager") {
    throw new Error("Only managers can view manager analytics");
  }

  if (!manager.departmentId) {
    throw new Error("Manager is not assigned to a department");
  }

  const teams = await Team.find({
    managerId: manager._id,
    departmentId: manager.departmentId,
    isActive: true,
  }).select("_id");

  const teamIds = teams.map((team) => team._id);

  const employees = await User.find({
    role: "employee",
    teamId: {
      $in: teamIds,
    },
    departmentId: manager.departmentId,
    isVerified: true,
  }).select("_id");

  const employeeIds = employees.map((employee) => employee._id);

  const [
    totalTeams,
    totalEmployees,
    totalTasks,
    completedTasks,
    inProgressTasks,
    blockedTasks,
    pendingTasks,
    presentAttendance,
    lateAttendance,
    halfDayAttendance,
    absentAttendance,
    onLeaveAttendance,
    pendingLeaves,
    approvedLeaves,
    rejectedLeaves,
  ] = await Promise.all([
    Team.countDocuments({
      managerId: manager._id,
      departmentId: manager.departmentId,
      isActive: true,
    }),

    User.countDocuments({
      role: "employee",
      teamId: {
        $in: teamIds,
      },
      departmentId: manager.departmentId,
      isVerified: true,
    }),

    Task.countDocuments({
      teamId: {
        $in: teamIds,
      },
      departmentId: manager.departmentId,
      isActive: true,
    }),

    Task.countDocuments({
      teamId: {
        $in: teamIds,
      },
      departmentId: manager.departmentId,
      isActive: true,
      status: "COMPLETED",
    }),

    Task.countDocuments({
      teamId: {
        $in: teamIds,
      },
      departmentId: manager.departmentId,
      isActive: true,
      status: "IN_PROGRESS",
    }),

    Task.countDocuments({
      teamId: {
        $in: teamIds,
      },
      departmentId: manager.departmentId,
      isActive: true,
      status: "BLOCKED",
    }),

    Task.countDocuments({
      teamId: {
        $in: teamIds,
      },
      departmentId: manager.departmentId,
      isActive: true,
      status: {
        $in: [
          "ASSIGNED",
          "ACCEPTED",
          "IN_REVIEW",
          "REWORK_REQUIRED",
        ],
      },
    }),

    Attendance.countDocuments({
      employeeId: {
        $in: employeeIds,
      },
      status: "PRESENT",
    }),

    Attendance.countDocuments({
      employeeId: {
        $in: employeeIds,
      },
      status: "LATE",
    }),

    Attendance.countDocuments({
      employeeId: {
        $in: employeeIds,
      },
      status: "HALF_DAY",
    }),

    Attendance.countDocuments({
      employeeId: {
        $in: employeeIds,
      },
      status: "ABSENT",
    }),

    Attendance.countDocuments({
      employeeId: {
        $in: employeeIds,
      },
      status: "ON_LEAVE",
    }),

    LeaveRequest.countDocuments({
      managerId: manager._id,
      status: "PENDING",
    }),

    LeaveRequest.countDocuments({
      managerId: manager._id,
      status: "APPROVED",
    }),

    LeaveRequest.countDocuments({
      managerId: manager._id,
      status: "REJECTED",
    }),
  ]);

  const averageProgress = await getAverageTaskProgress({
    teamId: {
      $in: teamIds,
    },
    departmentId: manager.departmentId,
  });

  return {
    role: "manager",

    team: {
      totalTeams,
      totalEmployees,
    },

    tasks: {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      blocked: blockedTasks,
      pending: pendingTasks,
      averageProgress,
    },

    attendance: {
      present: presentAttendance,
      late: lateAttendance,
      halfDay: halfDayAttendance,
      absent: absentAttendance,
      onLeave: onLeaveAttendance,
    },

    leave: {
      pending: pendingLeaves,
      approved: approvedLeaves,
      rejected: rejectedLeaves,
    },
  };
};

const getEmployeeAnalytics = async (employeeId) => {
  const employee = await User.findById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (employee.role !== "employee") {
    throw new Error("Only employees can view employee analytics");
  }

  const [
    totalTasks,
    completedTasks,
    inProgressTasks,
    blockedTasks,
    pendingTasks,
    presentAttendance,
    lateAttendance,
    halfDayAttendance,
    absentAttendance,
    onLeaveAttendance,
    pendingLeaves,
    approvedLeaves,
    rejectedLeaves,
  ] = await Promise.all([
    Task.countDocuments({
      assignedTo: employee._id,
      isActive: true,
    }),

    Task.countDocuments({
      assignedTo: employee._id,
      isActive: true,
      status: "COMPLETED",
    }),

    Task.countDocuments({
      assignedTo: employee._id,
      isActive: true,
      status: "IN_PROGRESS",
    }),

    Task.countDocuments({
      assignedTo: employee._id,
      isActive: true,
      status: "BLOCKED",
    }),

    Task.countDocuments({
      assignedTo: employee._id,
      isActive: true,
      status: {
        $in: [
          "ASSIGNED",
          "ACCEPTED",
          "IN_REVIEW",
          "REWORK_REQUIRED",
        ],
      },
    }),

    Attendance.countDocuments({
      employeeId: employee._id,
      status: "PRESENT",
    }),

    Attendance.countDocuments({
      employeeId: employee._id,
      status: "LATE",
    }),

    Attendance.countDocuments({
      employeeId: employee._id,
      status: "HALF_DAY",
    }),

    Attendance.countDocuments({
      employeeId: employee._id,
      status: "ABSENT",
    }),

    Attendance.countDocuments({
      employeeId: employee._id,
      status: "ON_LEAVE",
    }),

    LeaveRequest.countDocuments({
      employeeId: employee._id,
      status: "PENDING",
    }),

    LeaveRequest.countDocuments({
      employeeId: employee._id,
      status: "APPROVED",
    }),

    LeaveRequest.countDocuments({
      employeeId: employee._id,
      status: "REJECTED",
    }),
  ]);

  const averageProgress = await getAverageTaskProgress({
    assignedTo: employee._id,
  });

  return {
    role: "employee",

    tasks: {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      blocked: blockedTasks,
      pending: pendingTasks,
      averageProgress,
    },

    attendance: {
      present: presentAttendance,
      late: lateAttendance,
      halfDay: halfDayAttendance,
      absent: absentAttendance,
      onLeave: onLeaveAttendance,
    },

    leave: {
      pending: pendingLeaves,
      approved: approvedLeaves,
      rejected: rejectedLeaves,
    },
  };
};
