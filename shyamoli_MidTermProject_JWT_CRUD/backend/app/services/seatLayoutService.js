
import Bus from "../models/Bus.js";
import SeatLayout from "../models/SeatLayout.js";

// CREATE SEAT LAYOUT
export const createSeatLayoutService = async ({ busId, seats }) => {
  const bus = await Bus.findOne({
    _id: busId,
    isActive: true,
  });

  if (!bus) {
    const error = new Error("Bus not found");
    error.statusCode = 404;
    throw error;
  }

  const existingSeatLayout = await SeatLayout.findOne({ bus: busId });

  if (existingSeatLayout) {
    const error = new Error("Seat layout already exists for this bus");
    error.statusCode = 409;
    throw error;
  }

  if (!Array.isArray(seats) || seats.length === 0) {
    const error = new Error("Seats are required");
    error.statusCode = 400;
    throw error;
  }

  if (seats.length !== bus.totalSeats) {
    const error = new Error(
      `Seat layout must contain exactly ${bus.totalSeats} seats or berths`,
    );
    error.statusCode = 400;
    throw error;
  }

  const seatNumbers = seats.map((seat) => seat.seatNumber);

  if (new Set(seatNumbers).size !== seatNumbers.length) {
    const error = new Error("Duplicate seat numbers are not allowed");
    error.statusCode = 400;
    throw error;
  }

  const isSleeper = bus.busType === "SLEEPER";

  if (isSleeper) {
    const invalidBerth = seats.some(
      (seat) =>
        !["upper", "lower"].includes(seat.berthLevel) ||
        !/^\d+[UL]$/.test(seat.seatNumber),
    );

    if (invalidBerth) {
      const error = new Error(
        "Sleeper berths must have unique numbers such as 1U and 1L, with upper or lower berth levels",
      );
      error.statusCode = 400;
      throw error;
    }
  }

  const updatedSeats = seats.map((seat) => ({
    seatNumber: seat.seatNumber,
    seatType: seat.seatType || "regular",
    berthLevel: isSleeper ? seat.berthLevel : null,
    ticketPrice: bus.ticketPrice,
  }));

  return SeatLayout.create({
    bus: busId,
    seats: updatedSeats,
    totalSeats: updatedSeats.length,
  });
};

// GET SEAT LAYOUT BY BUS ID
export const getSeatLayoutService = async (busId) => {
  const seatLayout = await SeatLayout.findOne({
    bus: busId,
  }).populate("bus");

  if (!seatLayout) {
    const error = new Error("Seat layout not found");
    error.statusCode = 404;
    throw error;
  }

  return seatLayout;
};
