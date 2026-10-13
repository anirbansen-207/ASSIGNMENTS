import Task from "../models/taskModel.js";
import TaskComment from "../models/taskComment.js";

// create Task Comment
export const createTaskCommentService = async (
  taskId,
  comment,
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

    if (user.role === "admin") {
      // Admin can comment on any active task
    } else if (user.role === "manager") {
      if (
        task.assignedBy.toString() !==
        user._id.toString()
      ) {
        throw new Error(
          "You are not authorized to comment on this task",
        );
      }
    } else if (user.role === "employee") {
      if (
        task.assignedTo.toString() !==
        user._id.toString()
      ) {
        throw new Error(
          "You are not authorized to comment on this task",
        );
      }
    } else {
      throw new Error(
        "You are not allowed to comment on tasks",
      );
    }

    const newComment = await TaskComment.create({
      taskId: task._id,
      userId: user._id,
      comment,
    });

    const populatedComment =
      await TaskComment.findById(newComment._id)
        .populate("userId", "name email role")
        .populate("taskId", "title status");

    return populatedComment;
  } catch (error) {
    throw new Error(error.message);
  }
};



// View Task Comments 
export const viewTaskCommentsService = async (
  taskId,
  user,
) => {
  try {
    // Check if task exists with given taskId which comes from params
    const task = await Task.findOne({
      _id: taskId,
      isActive: true,
    });

    if (!task) {
      throw new Error("Task not found");
    }

    if (user.role === "admin") {
      // Admin can view any task comments
    } else if (user.role === "manager") {
      if (
        task.assignedBy.toString() !==
        user._id.toString()
      ) {
        throw new Error(
          "You are not authorized to view comments of this task",
        );
      }
    } else if (user.role === "employee") {
      if (
        task.assignedTo.toString() !==
        user._id.toString()
      ) {
        throw new Error(
          "You are not authorized to view comments of this task",
        );
      }
    } else {
      throw new Error(
        "You are not allowed to view task comments",
      );
    }

    // Get all comments of the task where taskId = task's _id
    const comments = await TaskComment.find({
      taskId: task._id,
    })
      .populate("userId", "name email role")
      .sort({ createdAt: 1 });

    return comments;
  } catch (error) {
    throw new Error(error.message);
  }
};