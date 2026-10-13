
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    attendanceDate: {
      type: Date,
      required: true,
      index: true,
    },

    checkInAt: {
      type: Date,
      default: null,
    },

    checkOutAt: {
      type: Date,
      default: null,
    },

    // True as soon as the employee starts their one permitted break.
    // It stays true even if the employee returns before 90 minutes.
    breakUsed: {
      type: Boolean,
      default: false,
    },

    // The timestamps are null until the corresponding action happens.
    breakStartedAt: {
      type: Date,
      default: null,
    },

    breakEndedAt: {
      type: Date,
      default: null,
    },

    // Total break duration in minutes, capped at 90.
    breakDurationMinutes: {
      type: Number,
      default: 0,
      min: 0,
      max: 90,
    },

    // Indicates that the backend ended the break at its 90-minute limit.
    breakAutoEnded: {
      type: Boolean,
      default: false,
    },

    // Lateness is recorded separately so a half-day can also be late.
    isLate: {
      type: Boolean,
      default: false,
    },

    // Minutes late beyond the 40-minute grace period.
    lateMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Time worked between check-in and checkout, excluding break time.
    totalWorkingMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Incomplete or unusual records can be reviewed by management.
    requiresReview: {
      type: Boolean,
      default: false,
    },

    reviewReason: {
      type: String,
      default: null,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "PRESENT",
        "LATE",
        "HALF_DAY",
        "ABSENT",
        "ON_LEAVE",
      ],
      default: "PRESENT",
    },

    correctionReason: {
      type: String,
      default: null,
      trim: true,
    },

    correctedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Prevents duplicate attendance records for the same employee and date.
attendanceSchema.index(
  {
    employeeId: 1,
    attendanceDate: 1,
  },
  {
    unique: true,
  },
);

const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema,
);

export default Attendance;
