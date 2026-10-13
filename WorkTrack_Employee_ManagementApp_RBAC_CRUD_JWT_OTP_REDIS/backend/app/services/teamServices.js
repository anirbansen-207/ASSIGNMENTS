
// Helper Functions
// Validate an eight-hour shift, including shifts that cross midnight.
const validateShiftTimes = (checkInTime, checkOutTime) => {
  if (!checkInTime || !checkOutTime) {
    throw new Error("Both shift start and shift end times are required");
  }

  const toMinutes = (value) => {
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
      throw new Error("Shift times must use HH:mm format");
    }

    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const start = toMinutes(checkInTime);
  let end = toMinutes(checkOutTime);

  if (end <= start) {
    end += 24 * 60;
  }

  if (end - start !== 8 * 60) {
    throw new Error(
      "Team shift start and end times must be exactly eight hours apart",
    );
  }
};

// Imports
import Team from "../models/Team.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import Task from "../models/taskModel.js";

import {
  createTeamValidation,
  updateTeamValidation,
} from "../validations/teamValidation.js";

// Create team
export const createTeamService = async (data, user) => {
  try {
    const { error } = createTeamValidation.validate(data);

    if (error) {
      throw new Error(error.details[0].message);
    }

    if (user.role === "admin" && !data.managerId) {
      throw new Error("managerId is required when admin creates a team");
    }

    const manager = await User.findById(data.managerId || user._id);

    if (!manager) {
      throw new Error("Manager not found");
    }

    if (manager.role !== "manager") {
      throw new Error("Only a manager can be assigned to a team");
    }

    if (!manager.departmentId) {
      throw new Error("Manager is not assigned to any department");
    }

    const department = await Department.findOne({
      _id: manager.departmentId,
      isActive: true,
    });

    if (!department) {
      throw new Error("Manager's department not found");
    }

    if (
      user.role === "manager" &&
      manager._id.toString() !== user._id.toString()
    ) {
      throw new Error("You can only create a team for yourself");
    }

    const existingTeam = await Team.findOne({
      name: data.name,
      departmentId: manager.departmentId,
      isActive: true,
    });

    if (existingTeam) {
      throw new Error(
        "A team with this name already exists in this department",
      );
    }

    validateShiftTimes(data.checkInTime, data.checkOutTime);

    const team = await Team.create({
      name: data.name,
      description: data.description || "",
      departmentId: manager.departmentId,
      managerId: manager._id,
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
    });

    return team;
  } catch (error) {
    throw new Error(error.message);
  }
};

// View all teams
export const viewAllTeamService = async (user) => {
  try {
    let teams;

    if (user.role === "admin") {
      teams = await Team.find({
        isActive: true,
      })
        .populate("managerId", "name email designation department")
        .populate("departmentId", "name description")
        .sort({
          name: 1,
        });
    } else if (user.role === "manager") {
      if (!user.departmentId) {
        throw new Error("Manager is not assigned to any department");
      }

      teams = await Team.find({
        managerId: user._id,
        departmentId: user.departmentId,
        isActive: true,
      })
        .populate("managerId", "name email designation department")
        .populate("departmentId", "name description")
        .sort({
          name: 1,
        });
    } else {
      throw new Error("You are not allowed to view all teams");
    }

    return teams;
  } catch (error) {
    throw new Error(error.message);
  }
};

// View single team
export const viewSingleTeamService = async (teamId, user) => {
  try {
    const team = await Team.findOne({
      _id: teamId,
      isActive: true,
    })
      .populate("managerId", "name email designation department")
      .populate("departmentId", "name description");

    if (!team) {
      throw new Error("Team not found");
    }

    if (user.role === "admin") {
      return team;
    }

    if (user.role === "manager") {
      if (team.managerId._id.toString() !== user._id.toString()) {
        throw new Error("You are not authorized to view this team");
      }

      if (team.departmentId._id.toString() !== user.departmentId.toString()) {
        throw new Error("You are not authorized to view this team");
      }

      return team;
    }

    if (user.role === "employee") {
      const employee = await User.findOne({
        _id: user._id,
        role: "employee",
        teamId: team._id,
      });

      if (!employee) {
        throw new Error("You are not authorized to view this team");
      }

      return team;
    }

    throw new Error("You are not allowed to view this team");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update team
export const updateTeamService = async (teamId, data, user) => {
  try {
    const { error } = updateTeamValidation.validate(data);

    if (error) {
      throw new Error(error.details[0].message);
    }

    const team = await Team.findOne({
      _id: teamId,
      isActive: true,
    });

    if (!team) {
      throw new Error("Team not found");
    }

    if (user.role === "manager") {
      if (team.managerId.toString() !== user._id.toString()) {
        throw new Error("You are not authorized to update this team");
      }

      if (
        !user.departmentId ||
        team.departmentId.toString() !== user.departmentId.toString()
      ) {
        throw new Error("You are not authorized to update this team");
      }
    } else if (user.role !== "admin") {
      throw new Error("You are not allowed to update teams");
    }

    if (data.name !== undefined) {
      const existingTeam = await Team.findOne({
        name: data.name,
        departmentId: team.departmentId,
        isActive: true,
        _id: {
          $ne: team._id,
        },
      });

      if (existingTeam) {
        throw new Error(
          "A team with this name already exists in this department",
        );
      }

      team.name = data.name;
    }

    if (data.description !== undefined) {
      team.description = data.description;
    }

    const nextCheckInTime = data.checkInTime ?? team.checkInTime;
    const nextCheckOutTime = data.checkOutTime ?? team.checkOutTime;

    if (data.checkInTime !== undefined || data.checkOutTime !== undefined) {
      validateShiftTimes(nextCheckInTime, nextCheckOutTime);

      team.checkInTime = nextCheckInTime;
      team.checkOutTime = nextCheckOutTime;
    }

    await team.save();

    return team;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete team permanently
export const deleteTeamService = async (teamId, user) => {
  try {
    const team = await Team.findOne({
      _id: teamId,
      isActive: true,
    });

    if (!team) {
      throw new Error("Team not found");
    }

    // Only the manager who owns the team or an admin can delete it.
    if (user.role === "manager") {
      if (team.managerId.toString() !== user._id.toString()) {
        throw new Error("You are not authorized to delete this team");
      }

      if (
        !user.departmentId ||
        team.departmentId.toString() !== user.departmentId.toString()
      ) {
        throw new Error("You are not authorized to delete this team");
      }
    } else if (user.role !== "admin") {
      throw new Error("You are not allowed to delete teams");
    }

    // Permanently delete all tasks belonging to this team.
    await Task.deleteMany({
      teamId: team._id,
    });

    // Remove the team assignment from its employees.
    await User.updateMany(
      {
        teamId: team._id,
      },
      {
        $set: {
          teamId: null,
        },
      },
    );

    // Permanently remove the team document from MongoDB.
    await Team.deleteOne({
      _id: team._id,
    });

    return {
      message: "Team and its tasks deleted successfully",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Add employee to team
export const addTeamMemberService = async (teamId, employeeId, user) => {
  try {
    const team = await Team.findOne({
      _id: teamId,
      isActive: true,
    });

    if (!team) {
      throw new Error("Team not found");
    }

    if (user.role === "manager") {
      if (team.managerId.toString() !== user._id.toString()) {
        throw new Error("You are not authorized to manage this team");
      }

      if (
        !user.departmentId ||
        team.departmentId.toString() !== user.departmentId.toString()
      ) {
        throw new Error("You are not authorized to manage this team");
      }
    } else if (user.role !== "admin") {
      throw new Error("You are not allowed to add team members");
    }

    const employee = await User.findOne({
      _id: employeeId,
      role: "employee",
      isVerified: true,
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Managers may add only employees they created themselves.
    // Admins can still assign eligible employees in the department.
    if (
      user.role === "manager" &&
      (
        !employee.createdBy ||
        employee.createdBy.toString() !== user._id.toString()
      )
    ) {
      throw new Error(
        "You can only assign employees you created to your teams",
      );
    }

    if (!employee.departmentId) {
      throw new Error("Employee is not assigned to any department");
    }

    if (employee.departmentId.toString() !== team.departmentId.toString()) {
      throw new Error("Employee does not belong to this team's department");
    }

    if (employee.teamId) {
      throw new Error("Employee is already assigned to a team");
    }

    employee.teamId = team._id;

    await employee.save();

    return employee;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Remove employee from team
export const removeTeamMemberService = async (teamId, employeeId, user) => {
  try {
    const team = await Team.findOne({
      _id: teamId,
      isActive: true,
    });

    if (!team) {
      throw new Error("Team not found");
    }

    if (user.role === "manager") {
      if (team.managerId.toString() !== user._id.toString()) {
        throw new Error("You are not authorized to manage this team");
      }

      if (
        !user.departmentId ||
        team.departmentId.toString() !== user.departmentId.toString()
      ) {
        throw new Error("You are not authorized to manage this team");
      }
    } else if (user.role !== "admin") {
      throw new Error("You are not allowed to remove team members");
    }

    const employee = await User.findOne({
      _id: employeeId,
      role: "employee",
      teamId: team._id,
    });

    if (!employee) {
      throw new Error("Employee is not a member of this team");
    }

    employee.teamId = null;

    await employee.save();

    return {
      message: "Employee removed from team successfully",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// View team members
export const viewTeamMembersService = async (teamId, user) => {
  try {
    const team = await Team.findOne({
      _id: teamId,
      isActive: true,
    });

    if (!team) {
      throw new Error("Team not found");
    }

    if (user.role === "admin") {
      // Admins can view members of any active team.
    } else if (user.role === "manager") {
      if (team.managerId.toString() !== user._id.toString()) {
        throw new Error("You are not authorized to view this team's members");
      }

      if (
        !user.departmentId ||
        team.departmentId.toString() !== user.departmentId.toString()
      ) {
        throw new Error("You are not authorized to view this team's members");
      }
    } else if (user.role === "employee") {
      if (!user.teamId || user.teamId.toString() !== team._id.toString()) {
        throw new Error("You are not authorized to view this team's members");
      }
    } else {
      throw new Error("You are not allowed to view team members");
    }

    const members = await User.find({
      role: "employee",
      teamId: team._id,
    }).select("_id name email designation department departmentId teamId");

    return members;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Employee view own team
export const viewMyTeamService = async (employeeId) => {
  try {
    const employee = await User.findOne({
      _id: employeeId,
      role: "employee",
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
    })
      .populate("managerId", "name email designation department")
      .populate("departmentId", "name description");

    if (!team) {
      throw new Error("Your team was not found");
    }

    return team;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Employee view own team members
export const viewMyTeamMembersService = async (employeeId) => {
  try {
    const employee = await User.findOne({
      _id: employeeId,
      role: "employee",
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    if (!employee.teamId) {
      throw new Error("You are not assigned to any team");
    }

    const members = await User.find({
      role: "employee",
      teamId: employee.teamId,
    }).select("_id name email designation department departmentId teamId");

    return members;
  } catch (error) {
    throw new Error(error.message);
  }
};

// View team work
export const viewTeamWorkService = async (teamId, user) => {
  try {
    const team = await Team.findOne({
      _id: teamId,
      isActive: true,
    });

    if (!team) {
      throw new Error("Team not found");
    }

    if (user.role === "admin") {
      // Admins can view any active team's work.
    } else if (user.role === "manager") {
      if (team.managerId.toString() !== user._id.toString()) {
        throw new Error("You are not authorized to view this team's work");
      }
    } else if (user.role === "employee") {
      if (!user.teamId || user.teamId.toString() !== team._id.toString()) {
        throw new Error("You are not authorized to view this team's work");
      }
    } else {
      throw new Error("You are not allowed to view team work");
    }

    return team;
  } catch (error) {
    throw new Error(error.message);
  }
};
