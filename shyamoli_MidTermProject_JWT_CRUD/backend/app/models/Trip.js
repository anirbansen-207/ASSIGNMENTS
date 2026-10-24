import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    // Route assigned to this trip
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },

    // Bus assigned to this trip
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },

    // Driver assigned to this trip
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },

    // Date of the trip
    travelDate: {
      type: Date,
      required: true,
    },

    // Scheduled departure
    departureTime: {
      type: Date,
      required: true,
    },

    // Scheduled arrival
    arrivalTime: {
      type: Date,
      required: true,
    },

    // Expected duration
    estimatedTravelTime: {
      type: String,
      required: true,
    },

    // Current status of the trip
    tripStatus: {
      type: String,
      enum: [
        "SCHEDULED",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "SCHEDULED",
    },

    // Soft deletion keeps old booking/ticket references intact.
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Super Admin who created the trip
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;