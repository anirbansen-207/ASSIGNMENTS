import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    // Employee who submitted the leave
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Manager responsible for reviewing the leave
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Type of leave
    leaveType: {
      type: String,
      enum: [
        "CASUAL",
        "SICK",
        "EARNED",
        "UNPAID",
      ],
      required: true,
    },

    // First day of leave
    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    // Last day of leave
    endDate: {
      type: Date,
      required: true,
      index: true,
    },

    // Number of leave days
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },

    // Reason given by employee
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // Leave approval status
    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
      ],
      default: "PENDING",
      index: true,
    },

    // Reason provided by manager when rejecting
    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },

    // Manager who approved/rejected the request
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Date on which manager reviewed the request
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "leave_requests",
  },
);

const LeaveRequest =
  mongoose.model(
    "LeaveRequest",
    leaveRequestSchema,
  );

export default LeaveRequest;