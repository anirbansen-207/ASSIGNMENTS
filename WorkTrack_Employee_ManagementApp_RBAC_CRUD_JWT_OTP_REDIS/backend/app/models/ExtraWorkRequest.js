
import mongoose from "mongoose";

const extraWorkRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    attendanceDate: {
      type: Date,
      required: true,
      index: true,
    },
    employeeReason: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 500,
    },

    // Fields for manager-created extra-duty assignments.
    taskTitle: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },
    taskDescription: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "ASSIGNED",
        "PENDING",
        "APPROVED",
        "REJECTED",
        "COMPLETED",
        "EXPIRED",
      ],
      default: "PENDING",
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    managerReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    approvedDurationMinutes: {
      type: Number,
      min: 1,
      max: 720,
      default: null,
    },
    actualStartAt: {
      type: Date,
      default: null,
    },
    approvedEndAt: {
      type: Date,
      default: null,
    },
    actualEndAt: {
      type: Date,
      default: null,
    },
    actualExtraMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },
    decisionAt: {
      type: Date,
      default: null,
    },
    autoCheckedOut: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Existing employee-request constraint is preserved.
extraWorkRequestSchema.index(
  { employeeId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "PENDING",
    },
  },
);

const ExtraWorkRequest = mongoose.model(
  "ExtraWorkRequest",
  extraWorkRequestSchema,
);

export default ExtraWorkRequest;
