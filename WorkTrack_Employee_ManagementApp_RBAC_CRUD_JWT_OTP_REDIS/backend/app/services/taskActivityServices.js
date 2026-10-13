
import Task from "../models/taskModel.js";
import TaskActivity from "../models/TaskActivity.js";
import {
  createTaskAdminActivityService,
} from "./adminActivityServices.js";

// Create the existing task history and mirror it to the admin feed.
export const createTaskActivityService = async ({
  taskId,
  userId,
  action,
  oldValue = null,
  newValue = null,
  description = "",
}) => {
  try {
    const activity = await TaskActivity.create({
      taskId,
      userId,
      action,
      oldValue,
      newValue,
      description,
    });

    // Keep the existing task-history record authoritative.
    // A feed failure must not break a valid task operation.
    try {
      await createTaskAdminActivityService({
        taskId,
        actorId: userId,
        action,
        description,
      });
    } catch (activityError) {
      console.error(
        "Failed to mirror task activity to admin feed:",
        activityError.message,
      );
    }

    return activity;
  } catch (error) {
    throw new Error(error.message);
  }
};

// View Task Activity service
export const viewTaskActivitiesService = async (
  taskId,
  user,
) => {
  try {
    const task = await Task.findOne({
      _id: taskId,
      isActive: true,
    });

    if (!task) {
      throw new Error("Task not found");
    }

    // Admin can view any task activity.
    if (user.role === "admin") {
      // No additional ownership check is needed for admins.
    } else if (user.role === "manager") {
      // A manager can view activities for tasks they assigned.
      if (
        task.assignedBy.toString() !==
        user._id.toString()
      ) {
        throw new Error(
          "You are not authorized to view this task activity",
        );
      }
    } else if (user.role === "employee") {
      // An employee can view activities for their assigned tasks.
      if (
        task.assignedTo.toString() !==
        user._id.toString()
      ) {
        throw new Error(
          "You are not authorized to view this task activity",
        );
      }
    } else {
      throw new Error(
        "You are not allowed to view task activity",
      );
    }

    const activities = await TaskActivity.find({
      taskId: task._id,
    })
      .populate("userId", "name email role")
      .sort({ createdAt: 1 });

    return activities;
  } catch (error) {
    throw new Error(error.message);
  }
};
