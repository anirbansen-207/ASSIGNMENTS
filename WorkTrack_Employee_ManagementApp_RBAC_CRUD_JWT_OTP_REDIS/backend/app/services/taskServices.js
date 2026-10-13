import Task from "../models/taskModel.js";
import User from "../models/User.js";
import Team from "../models/Team.js";

import { createTaskActivityService } from "./taskActivityServices.js";

import {
  createTaskValidation,
  updateTaskValidation,
  updateProgressValidation,
  updateStatusValidation,
} from "../validations/taskValidation.js";

import { createNotificationService } from "./notificationServices.js";

/* =========================================================
   CREATE TASK
========================================================= */

export const createTaskService = async (data, userId) => {
  try {
    const { error } = createTaskValidation.validate(data);

    if (error) {
      throw new Error(error.details[0].message);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!["admin", "manager"].includes(user.role)) {
      throw new Error("You are not allowed to create tasks");
    }

    const team = await Team.findOne({
      _id: data.teamId,
      isActive: true,
    });

    if (!team) {
      throw new Error("Team not found");
    }

    const employee = await User.findOne({
      _id: data.assignedTo,
      role: "employee",
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Manager can only create tasks for own team
    if (user.role === "manager") {
      if (team.managerId.toString() !== user._id.toString()) {
        throw new Error("You can only create tasks for your own team");
      }

      // Managers may assign tasks only to employees they created.
      // Do not rely only on frontend filtering for authorization.
      if (
        user.role === "manager" &&
        (!employee.createdBy ||
          employee.createdBy.toString() !== user._id.toString())
      ) {
        throw new Error("You can only assign tasks to employees you created");
      }

      if (
        !user.departmentId ||
        team.departmentId.toString() !== user.departmentId.toString()
      ) {
        throw new Error("Team does not belong to your department");
      }
    }

    // Employee must belong to the selected team
    if (
      !employee.teamId ||
      employee.teamId.toString() !== team._id.toString()
    ) {
      throw new Error("Employee does not belong to this team");
    }

    // Employee and team must belong to same department
    if (
      !employee.departmentId ||
      employee.departmentId.toString() !== team.departmentId.toString()
    ) {
      throw new Error("Employee and team must belong to the same department");
    }

    // Date validation
    if (new Date(data.dueDate) < new Date(data.startDate)) {
      throw new Error("Due date cannot be before start date");
    }

    const task = await Task.create({
      title: data.title,
      description: data.description || "",

      teamId: team._id,
      assignedTo: employee._id,
      assignedBy: user._id,
      departmentId: team.departmentId,

      priority: data.priority || "MEDIUM",

      startDate: data.startDate,
      dueDate: data.dueDate,

      estimatedHours: data.estimatedHours || 0,

      progress: 0,
      status: "ASSIGNED",
      actualHours: 0,
      completedAt: null,
    });

    // Create task activity
    await createTaskActivityService({
      taskId: task._id,
      userId: user._id,
      action: "TASK_CREATED",
      oldValue: null,
      newValue: "ASSIGNED",
      description: "Task created and assigned",
    });

    // Notify the assigned employee after the task is created.
    await createNotificationService({
      recipientId: employee._id,
      type: "TASK_ASSIGNED",
      title: "New Task Assigned",
      message: `${user.name} assigned you a task: "${task.title}".`,
      relatedId: task._id,
    });

    return task;
  } catch (error) {
    throw new Error(error.message);
  }
};

/* =========================================================
   VIEW ALL TASKS
========================================================= */

export const viewAllTasksService = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    let query = {
      isActive: true,
    };

    // Admin → all tasks
    if (user.role === "admin") {
      // No additional filter
    }

    // Manager → own team's tasks
    else if (user.role === "manager") {
      if (!user.departmentId) {
        throw new Error("Manager is not assigned to a department");
      }

      const teams = await Team.find({
        managerId: user._id,
        departmentId: user.departmentId,
        isActive: true,
      }).select("_id");

      const teamIds = teams.map((team) => team._id);

      query.teamId = {
        $in: teamIds,
      };
    } else {
      throw new Error("You are not allowed to view all tasks");
    }

    const tasks = await Task.find(query)
      .populate("teamId", "name")
      .populate("assignedTo", "name email designation")
      .populate("assignedBy", "name email designation")
      .populate("departmentId", "name")
      .sort({ dueDate: 1 });

    return tasks;
  } catch (error) {
    throw new Error(error.message);
  }
};

/* =========================================================
   VIEW SINGLE TASK
========================================================= */

export const viewSingleTaskService = async (taskId, userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const task = await Task.findOne({
      _id: taskId,
      isActive: true,
    })
      .populate("teamId", "name")
      .populate("assignedTo", "name email designation")
      .populate("assignedBy", "name email designation")
      .populate("departmentId", "name");

    if (!task) {
      throw new Error("Task not found");
    }

    // Admin → any task
    if (user.role === "admin") {
      return task;
    }

    // Manager → own task
    if (user.role === "manager") {
      if (task.assignedBy._id.toString() !== user._id.toString()) {
        throw new Error("You are not allowed to access this task");
      }

      return task;
    }

    // Employee → only assigned task
    if (user.role === "employee") {
      if (task.assignedTo._id.toString() !== user._id.toString()) {
        throw new Error("You are not allowed to access this task");
      }

      return task;
    }

    throw new Error("You are not allowed to access this task");
  } catch (error) {
    throw new Error(error.message);
  }
};

/* =========================================================
   UPDATE TASK
========================================================= */

export const updateTaskService = async (taskId, data, userId) => {
  try {
    const { error } = updateTaskValidation.validate(data);

    if (error) {
      throw new Error(error.details[0].message);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!["admin", "manager"].includes(user.role)) {
      throw new Error("You are not allowed to update this task");
    }

    const task = await Task.findOne({
      _id: taskId,
      isActive: true,
    });

    if (!task) {
      throw new Error("Task not found");
    }

    // Manager can only update own task
    if (user.role === "manager") {
      if (task.assignedBy.toString() !== user._id.toString()) {
        throw new Error("You are not allowed to update this task");
      }
    }

    if (data.title !== undefined) {
      task.title = data.title;
    }

    if (data.description !== undefined) {
      task.description = data.description;
    }

    if (data.priority !== undefined) {
      task.priority = data.priority;
    }

    if (data.startDate !== undefined) {
      task.startDate = data.startDate;
    }

    if (data.dueDate !== undefined) {
      task.dueDate = data.dueDate;
    }

    if (data.estimatedHours !== undefined) {
      task.estimatedHours = data.estimatedHours;
    }

    if (data.actualHours !== undefined) {
      task.actualHours = data.actualHours;
    }

    if (task.dueDate < task.startDate) {
      throw new Error("Due date cannot be before start date");
    }

    await task.save();

    // Create task activity
    await createTaskActivityService({
      taskId: task._id,
      userId: user._id,
      action: "TASK_UPDATED",
      oldValue: null,
      newValue: "UPDATED",
      description: "Task details updated",
    });

    return task;
  } catch (error) {
    throw new Error(error.message);
  }
};

/* =========================================================
   DELETE TASK
========================================================= */

export const deleteTaskService = async (taskId, userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!["admin", "manager"].includes(user.role)) {
      throw new Error("You are not allowed to delete tasks");
    }

    const task = await Task.findOne({
      _id: taskId,
      isActive: true,
    });

    if (!task) {
      throw new Error("Task not found");
    }

    if (user.role === "manager") {
      if (task.assignedBy.toString() !== user._id.toString()) {
        throw new Error("You are not allowed to delete this task");
      }
    }

    task.isActive = false;

    await task.save();

    // Create task activity
    await createTaskActivityService({
      taskId: task._id,
      userId: user._id,
      action: "TASK_DELETED",
      oldValue: "ACTIVE",
      newValue: "DELETED",
      description: "Task deleted",
    });

    return {
      message: "Task deleted successfully",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/* =========================================================
   EMPLOYEE → MY TASKS
========================================================= */

export const viewMyTasksService = async (employeeId) => {
  try {
    const employee = await User.findById(employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    if (employee.role !== "employee") {
      throw new Error("Only employees can use this endpoint");
    }

    const tasks = await Task.find({
      assignedTo: employee._id,
      isActive: true,
    })
      .populate("teamId", "name")
      .populate("assignedBy", "name email designation")
      .populate("departmentId", "name")
      .sort({ dueDate: 1 });

    return tasks;
  } catch (error) {
    throw new Error(error.message);
  }
};

/* =========================================================
   EMPLOYEE → MY TEAM TASKS
========================================================= */

export const viewMyTeamTasksService = async (employeeId) => {
  try {
    const employee = await User.findById(employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    if (employee.role !== "employee") {
      throw new Error("Only employees can use this endpoint");
    }

    if (!employee.teamId) {
      throw new Error("You are not assigned to any team");
    }

    const tasks = await Task.find({
      teamId: employee.teamId,
      isActive: true,
    })
      .populate("assignedTo", "name designation")
      .populate("assignedBy", "name designation")
      .sort({ dueDate: 1 });

    return tasks;
  } catch (error) {
    throw new Error(error.message);
  }
};

/* =========================================================
   ACCEPT TASK
========================================================= */

export const acceptTaskService = async (taskId, employeeId) => {
  try {
    const employee = await User.findById(employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    const task = await Task.findOne({
      _id: taskId,
      isActive: true,
    });

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.assignedTo.toString() !== employee._id.toString()) {
      throw new Error("You are not allowed to accept this task");
    }

    if (task.status !== "ASSIGNED") {
      throw new Error("Only assigned tasks can be accepted");
    }

    const oldStatus = task.status;

    task.status = "ACCEPTED";

    await task.save();

    // Create task activity
    await createTaskActivityService({
      taskId: task._id,
      userId: employee._id,
      action: "TASK_ACCEPTED",
      oldValue: oldStatus,
      newValue: task.status,
      description: "Employee accepted the task",
    });

    return task;
  } catch (error) {
    throw new Error(error.message);
  }
};

/* =========================================================
   UPDATE TASK STATUS
========================================================= */

export const updateTaskStatusService = async (taskId, status, userId) => {
  try {
    const { error } = updateStatusValidation.validate({
      status,
    });

    if (error) {
      throw new Error(error.details[0].message);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const task = await Task.findOne({
      _id: taskId,
      isActive: true,
    });

    if (!task) {
      throw new Error("Task not found");
    }

    // Employee
    if (user.role === "employee") {
      if (task.assignedTo.toString() !== user._id.toString()) {
        throw new Error("You are not allowed to update this task");
      }

      const allowedStatuses = ["IN_PROGRESS", "BLOCKED", "IN_REVIEW"];

      if (!allowedStatuses.includes(status)) {
        throw new Error("Employee cannot set this task status");
      }

      if (
        status === "IN_PROGRESS" &&
        !["ACCEPTED", "REWORK_REQUIRED"].includes(task.status)
      ) {
        throw new Error(
          "Task must be accepted or require rework before starting",
        );
      }

      if (status === "BLOCKED" && task.status !== "IN_PROGRESS") {
        throw new Error("Only an in-progress task can be blocked");
      }

      if (status === "IN_REVIEW" && task.status !== "IN_PROGRESS") {
        throw new Error("Only an in-progress task can be submitted for review");
      }
    }

    // Manager
    if (user.role === "manager") {
      if (task.assignedBy.toString() !== user._id.toString()) {
        throw new Error("You are not allowed to review this task");
      }

      const allowedStatuses = ["REWORK_REQUIRED", "COMPLETED"];

      if (!allowedStatuses.includes(status)) {
        throw new Error(
          "Manager can only mark a task as rework required or completed",
        );
      }

      if (status === "COMPLETED") {
        if (task.status !== "IN_REVIEW") {
          throw new Error("Only a task submitted for review can be completed");
        }

        task.progress = 100;
        task.completedAt = new Date();
      }

      if (status === "REWORK_REQUIRED") {
        if (task.status !== "IN_REVIEW") {
          throw new Error(
            "Only a task submitted for review can be sent for rework",
          );
        }
      }
    }

    // Admin
    if (user.role === "admin") {
      if (status === "COMPLETED") {
        task.progress = 100;
        task.completedAt = new Date();
      }
    }

    const oldStatus = task.status;

    task.status = status;

    await task.save();

    // Create task activity
    await createTaskActivityService({
      taskId: task._id,
      userId: user._id,
      action: "TASK_STATUS_CHANGED",
      oldValue: oldStatus,
      newValue: task.status,
      description: `Task status changed from ${oldStatus} to ${task.status}`,
    });

    return task;
  } catch (error) {
    throw new Error(error.message);
  }
};

/* =========================================================
   UPDATE TASK PROGRESS
========================================================= */

export const updateTaskProgressService = async (taskId, data, userId) => {
  try {
    const { error } = updateProgressValidation.validate(data);

    if (error) {
      throw new Error(error.details[0].message);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const task = await Task.findOne({
      _id: taskId,
      isActive: true,
    });

    if (!task) {
      throw new Error("Task not found");
    }

    // Employee → own task
    if (user.role === "employee") {
      if (task.assignedTo.toString() !== user._id.toString()) {
        throw new Error("You can only update your own task progress");
      }
    }

    // Manager → own task
    else if (user.role === "manager") {
      if (task.assignedBy.toString() !== user._id.toString()) {
        throw new Error("You are not allowed to update this task");
      }
    }

    // Admin
    else if (user.role !== "admin") {
      throw new Error("You are not allowed to update task progress");
    }

    if (task.status === "COMPLETED") {
      throw new Error("Completed task progress cannot be changed");
    }

    const oldProgress = task.progress;

    task.progress = data.progress;

    if (data.actualHours !== undefined) {
      task.actualHours = data.actualHours;
    }

    await task.save();

    // Create task activity
    await createTaskActivityService({
      taskId: task._id,
      userId: user._id,
      action: "TASK_PROGRESS_UPDATED",
      oldValue: oldProgress.toString(),
      newValue: task.progress.toString(),
      description: `Task progress updated from ${oldProgress}% to ${task.progress}%`,
    });

    return task;
  } catch (error) {
    throw new Error(error.message);
  }
};
