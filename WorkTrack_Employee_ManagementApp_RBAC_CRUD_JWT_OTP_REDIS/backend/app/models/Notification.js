import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,

      enum: [
        "LEAVE_APPROVED",
        "LEAVE_REJECTED",
        "TASK_ASSIGNED",
        "TASK_STATUS_CHANGED",
        "TASK_REWORK_REQUIRED",
        "REPORT_SUBMITTED",
        "REPORT_APPROVED",
        "REPORT_REJECTED",
        "ATTENDANCE_CORRECTED",
        "EXTRA_WORK_ASSIGNED",
        "EXTRA_WORK_REQUEST",
        "EXTRA_WORK_APPROVED",
        "EXTRA_WORK_REJECTED",
        "EXTRA_WORK_COMPLETED",
      ],
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "notifications",
  },
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
