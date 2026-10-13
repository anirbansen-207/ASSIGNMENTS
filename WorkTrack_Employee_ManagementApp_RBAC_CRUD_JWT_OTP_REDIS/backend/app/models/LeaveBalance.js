import mongoose from "mongoose";

const leaveBalanceSchema =
  new mongoose.Schema(
    {
      // Employee whose balance belongs to this record
      employeeId: {
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

      // Total days allocated to the employee
      totalDays: {
        type: Number,
        required: true,
        min: 0,
      },

      // Days already consumed
      usedDays: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    {
      timestamps: true,
      collection: "leave_balances",
    },
  );

// One balance per employee and leave type
leaveBalanceSchema.index(
  {
    employeeId: 1,
    leaveType: 1,
  },
  {
    unique: true,
  },
);

const LeaveBalance =
  mongoose.model(
    "LeaveBalance",
    leaveBalanceSchema,
  );

export default LeaveBalance;