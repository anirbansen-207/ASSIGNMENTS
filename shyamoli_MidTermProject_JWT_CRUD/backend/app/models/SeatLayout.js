
import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
    },

    seatType: {
      type: String,
      enum: ["regular", "vip", "ladies", "reserved"],
      default: "regular",
    },

    // Used only for sleeper berths: "upper" or "lower".
    berthLevel: {
      type: String,
      enum: ["upper", "lower", null],
      default: null,
    },

    ticketPrice: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const seatLayoutSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
      unique: true,
    },

    seats: {
      type: [seatSchema],
      required: true,
    },

    totalSeats: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const SeatLayout = mongoose.model("SeatLayout", seatLayoutSchema);

export default SeatLayout;
