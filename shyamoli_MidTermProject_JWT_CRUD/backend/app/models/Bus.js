
import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // GreenBus is the fixed company name for every bus.
    busName: {
      type: String,
      required: true,
      default: "GreenBus",
      enum: ["GreenBus"],
      trim: true,
    },

    busType: {
      type: String,
      enum: ["AC", "NON_AC", "SLEEPER", "SEATER"],
      required: true,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },

    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Bus = mongoose.model("Bus", busSchema);

export default Bus;
