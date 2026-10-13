
import mongoose from "mongoose";

const departmentLeaveTypeSchema = new mongoose.Schema(
  {
    leaveType: {
      type: String,
      enum: ["CASUAL", "SICK", "EARNED", "UNPAID"],
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const departmentLeavePolicySchema = new mongoose.Schema(
  {
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      unique: true,
      index: true,
    },
    leaveTypes: {
      type: [departmentLeaveTypeSchema],
      required: true,
      validate: {
        validator(leaveTypes) {
          if (!Array.isArray(leaveTypes) || leaveTypes.length === 0) {
            return false;
          }

          const types = leaveTypes.map((item) => item.leaveType);

          return new Set(types).size === types.length;
        },
        message: "Leave types must not be empty or duplicated.",
      },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "department_leave_policies",
  },
);

const DepartmentLeavePolicy = mongoose.model(
  "DepartmentLeavePolicy",
  departmentLeavePolicySchema,
);

export default DepartmentLeavePolicy;
