import mongoose from "mongoose";

const taskActivitySchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "TASK_CREATED",
        "TASK_ACCEPTED",
        "TASK_STATUS_CHANGED",
        "TASK_PROGRESS_UPDATED",
        "TASK_UPDATED",
        "TASK_DELETED",
      ],
    },

    oldValue: {
      type: String,
      default: null,
    },

    newValue: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const TaskActivity = mongoose.model(
  "TaskActivity",
  taskActivitySchema,
);

export default TaskActivity;