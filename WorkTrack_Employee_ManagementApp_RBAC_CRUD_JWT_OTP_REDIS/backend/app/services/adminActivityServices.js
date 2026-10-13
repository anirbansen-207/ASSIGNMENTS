
import mongoose from "mongoose";
import AdminActivity from "../models/AdminActivity.js";
import User from "../models/User.js";
import Task from "../models/taskModel.js";

const toId = (value) => (value?._id ? value._id : value);

export const createAdminActivityEventService = async ({
  actorId,
  type,
  title,
  message,
  relatedId = null,
  teamId = null,
  departmentId = null,
  subjectUserId = null,
}) => {
  try {
    const actor = await User.findById(actorId).select(
      "name role teamId departmentId",
    );

    if (!actor) {
      throw new Error("Activity actor not found");
    }

    const subject = subjectUserId
      ? await User.findById(subjectUserId).select(
          "teamId departmentId",
        )
      : null;

    const activity = await AdminActivity.create({
      actorId: actor._id,
      actorName: actor.name,
      actorRole: actor.role,
      teamId:
        toId(teamId) ||
        subject?.teamId ||
        actor.teamId ||
        null,
      departmentId:
        toId(departmentId) ||
        subject?.departmentId ||
        actor.departmentId ||
        null,
      type,
      title,
      message,
      relatedId: relatedId || null,
    });

    return activity;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Mirrors the existing task-history events into the admin feed.
export const createTaskAdminActivityService = async ({
  taskId,
  actorId,
  action,
  description = "",
}) => {
  try {
    const task = await Task.findById(taskId).select(
      "title teamId departmentId assignedTo",
    );

    if (!task) {
      return null;
    }

    const actionLabels = {
      TASK_CREATED: ["Task Created", "TASK_CREATED"],
      TASK_ACCEPTED: ["Task Accepted", "TASK_ACCEPTED"],
      TASK_STATUS_CHANGED: [
        "Task Status Changed",
        "TASK_STATUS_CHANGED",
      ],
      TASK_PROGRESS_UPDATED: [
        "Task Progress Updated",
        "TASK_PROGRESS_UPDATED",
      ],
      TASK_UPDATED: ["Task Updated", "TASK_UPDATED"],
      TASK_DELETED: ["Task Deleted", "TASK_DELETED"],
    };

    const [title, type] = actionLabels[action] || [
      "Task Activity",
      action,
    ];

    const actor = await User.findById(actorId).select(
      "name role",
    );

    if (!actor) {
      return null;
    }

    return await createAdminActivityEventService({
      actorId: actor._id,
      type,
      title,
      message: `${actor.name}: ${
        description || title
      }${task.title ? ` — ${task.title}` : ""}`,
      relatedId: task._id,
      teamId: task.teamId,
      departmentId: task.departmentId,
      subjectUserId: task.assignedTo,
    });
  } catch (error) {
    // Admin activity logging must not break a valid task operation.
    console.error(
      "Failed to record task admin activity:",
      error.message,
    );

    return null;
  }
};

export const viewAdminActivityService = async (
  filters = {},
) => {
  try {
    const {
      actorRole,
      teamId,
      departmentId,
      type,
      limit = 200,
    } = filters;

    const query = {};

    if (
      actorRole &&
      ["admin", "manager", "employee"].includes(actorRole)
    ) {
      query.actorRole = actorRole;
    }

    if (teamId) {
      if (!mongoose.Types.ObjectId.isValid(teamId)) {
        throw new Error("Invalid team filter");
      }

      query.teamId = teamId;
    }

    if (departmentId) {
      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        throw new Error("Invalid department filter");
      }

      query.departmentId = departmentId;
    }

    if (type) {
      query.type = type;
    }

    const safeLimit = Math.min(
      Math.max(Number(limit) || 200, 1),
      500,
    );

    return await AdminActivity.find(query)
      .populate("teamId", "name")
      .populate("departmentId", "name")
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean();
  } catch (error) {
    throw new Error(error.message);
  }
};
