
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    seatNumbers: {
      type: [String],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "CONFIRMED",
        "CANCELLED",
      ],
      default: "CONFIRMED",
    },

    // Customer bookings hold seats for 10 minutes.
    // Confirmed and offline bookings have no expiry.
    expiresAt: {
      type: Date,
      default: null,
    },

    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent overlapping active reservations.
// Expired pending bookings must be changed to CANCELLED
// before the same seat can be reserved again.
bookingSchema.index(
  {
    tripId: 1,
    seatNumbers: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ["PENDING_PAYMENT", "CONFIRMED"],
      },
    },
  },
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
