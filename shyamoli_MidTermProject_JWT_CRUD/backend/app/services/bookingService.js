import Bus from "../models/Bus.js";
import Booking from "../models/Booking.js";
import Trip from "../models/Trip.js";
import SeatLayout from "../models/SeatLayout.js";
import Ticket from "../models/TicketGeneration.js";

// Helper Function

const BOOKING_HOLD_MINUTES = 10;

// Expire pending bookings for a trip before checking seat availability.
// This is safe to call repeatedly.
export const expirePendingBookingsService = async (tripId) => {
  await Booking.updateMany(
    {
      tripId,
      status: "PENDING_PAYMENT",
      expiresAt: { $lte: new Date() },
    },
    {
      $set: {
        status: "CANCELLED",
        expiresAt: null,
      },
    },
  );
};


// CREATE BOOKING

export const createBookingService = async ({
  customerId,
  tripId,
  seatNumbers,
  bookingStatus = "PENDING_PAYMENT",
}) => {
  if (
    !customerId ||
    !tripId ||
    !Array.isArray(seatNumbers) ||
    seatNumbers.length === 0
  ) {
    const error = new Error(
      "Customer, trip and seat numbers are required",
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    !["PENDING_PAYMENT", "CONFIRMED"].includes(bookingStatus)
  ) {
    const error = new Error("Invalid booking status");
    error.statusCode = 400;
    throw error;
  }

  if (new Set(seatNumbers).size !== seatNumbers.length) {
    const error = new Error(
      "Duplicate seat numbers are not allowed",
    );
    error.statusCode = 400;
    throw error;
  }

  const trip = await Trip.findById(tripId);

  if (!trip || trip.isDeleted) {
    const error = new Error("Trip not found");
    error.statusCode = 404;
    throw error;
  }

  if (trip.tripStatus !== "SCHEDULED") {
    const error = new Error(
      "Booking is only allowed for scheduled trips",
    );
    error.statusCode = 400;
    throw error;
  }

  // Release expired holds before checking requested seats.
  await expirePendingBookingsService(tripId);

  const seatLayout = await SeatLayout.findOne({
    bus: trip.busId,
  });

  if (!seatLayout) {
    const error = new Error("Seat layout not found for this bus");
    error.statusCode = 404;
    throw error;
  }

  const selectedSeats = seatLayout.seats.filter((seat) =>
    seatNumbers.includes(seat.seatNumber),
  );

  if (selectedSeats.length !== seatNumbers.length) {
    const error = new Error("One or more selected seats are invalid");
    error.statusCode = 400;
    throw error;
  }

  // Check active reservations, including unexpired payment holds.
  const existingBookings = await Booking.find({
    tripId,
    status: { $in: ["CONFIRMED", "PENDING_PAYMENT"] },
    seatNumbers: { $in: seatNumbers },
    $or: [
      { status: "CONFIRMED" },
      {
        status: "PENDING_PAYMENT",
        expiresAt: { $gt: new Date() },
      },
    ],
  }).select("seatNumbers");

  if (existingBookings.length > 0) {
    const bookedSeats = existingBookings.flatMap(
      (booking) => booking.seatNumbers,
    );

    const conflictingSeats = seatNumbers.filter((seatNumber) =>
      bookedSeats.includes(seatNumber),
    );

    const error = new Error(
      `Seat(s) unavailable: ${conflictingSeats.join(", ")}`,
    );
    error.statusCode = 409;
    throw error;
  }

  const totalAmount = selectedSeats.reduce(
    (total, seat) => total + seat.ticketPrice,
    0,
  );

  const ticketPrice = selectedSeats[0].ticketPrice;

  // Only online customer bookings get a temporary hold.
  const expiresAt =
    bookingStatus === "PENDING_PAYMENT"
      ? new Date(Date.now() + BOOKING_HOLD_MINUTES * 60 * 1000)
      : null;

  try {
    return await Booking.create({
      customerId,
      tripId,
      seatNumbers,
      ticketPrice,
      totalAmount,
      status: bookingStatus,
      expiresAt,
    });
  } catch (error) {
    // The unique index is the final protection against
    // simultaneous attempts to reserve the same seat.
    if (error.code === 11000) {
      const conflictError = new Error(
        "One or more selected seats were just reserved by another customer. Please select different seats.",
      );
      conflictError.statusCode = 409;
      throw conflictError;
    }

    throw error;
  }
};



// GET ALL BOOKINGS
export const getAllBookingService = async () => {
  return Booking.find({
    status: "CONFIRMED",
  })
    .populate("customerId", "name phone email")
    .populate({
      path: "tripId",
      populate: {
        path: "routeId",
        select: "sourceCity destinationCity routeDistance routeStatus",
      },
    })
    .populate({
      path: "tripId",
      populate: {
        path: "busId",
        select: "busNumber busName busType totalSeats availableSeats",
      },
    })
    .populate({
      path: "tripId",
      populate: {
        path: "driverId",
        select: "name email phone",
      },
    });
};


// GET SINGLE BOOKING
export const getSingleBookingService = async (
  bookingId,
  customerId,
) => {
  const query = {
    _id: bookingId,
  };

  // Restrict customer requests to their own bookings.
  // Admin/staff calls can omit customerId according to
  // the existing controller and authorization rules.
  if (customerId) {
    query.customerId = customerId;
  }

  const singleBooking = await Booking.findOne(query)
    .populate("customerId", "name phone email")
    .populate({
      path: "tripId",
      populate: {
        path: "routeId",
        select: "sourceCity destinationCity routeDistance routeStatus",
      },
    })
    .populate({
      path: "tripId",
      populate: {
        path: "busId",
        select: "busNumber busName busType totalSeats availableSeats",
      },
    })
    .populate({
      path: "tripId",
      populate: {
        path: "driverId",
        select: "name email phone",
      },
    });

  if (!singleBooking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  return singleBooking;
};


// CANCEL BOOKING
export const cancelBookingService = async ({
  bookingId,
  customerId,
}) => {
  if (!bookingId) {
    const error = new Error("Booking ID is required");
    error.statusCode = 400;
    throw error;
  }

  // Customers can cancel only their own bookings.
  // If customerId is omitted, the caller must be an authorized
  // staff/controller flow that permits cancellation by booking ID.
  const bookingQuery = { _id: bookingId };

  if (customerId) {
    bookingQuery.customerId = customerId;
  }

  const booking = await Booking.findOne(bookingQuery);

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  if (booking.status === "CANCELLED") {
    const error = new Error("Booking is already cancelled");
    error.statusCode = 400;
    throw error;
  }

  if (
    !["PENDING_PAYMENT", "CONFIRMED"].includes(booking.status)
  ) {
    const error = new Error(
      "This booking cannot be cancelled",
    );
    error.statusCode = 400;
    throw error;
  }

  // Release the booking and its seat hold.
  booking.status = "CANCELLED";
  booking.expiresAt = null;

  await booking.save();

  // Mark any active ticket as cancelled.
  await Ticket.findOneAndUpdate(
    {
      bookingId: booking._id,
      ticketStatus: "ACTIVE",
    },
    {
      $set: {
        ticketStatus: "CANCELLED",
      },
    },
  );

  return booking;
};

// GET AVAILABLE SEATS
// GET AVAILABLE SEATS

export const getAvailableSeatsService = async (tripId) => {
  const trip = await Trip.findById(tripId);

  if (!trip || trip.isDeleted) {
    const error = new Error("Trip not found");
    error.statusCode = 404;
    throw error;
  }

  await expirePendingBookingsService(tripId);

  const seatLayout = await SeatLayout.findOne({
    bus: trip.busId,
  });

  if (!seatLayout) {
    const error = new Error("Seat layout not found for this bus");
    error.statusCode = 404;
    throw error;
  }

  const bookings = await Booking.find({
    tripId,
    $or: [
      { status: "CONFIRMED" },
      {
        status: "PENDING_PAYMENT",
        expiresAt: { $gt: new Date() },
      },
    ],
  }).select("seatNumbers");

  const bookedSeats = bookings.flatMap(
    (booking) => booking.seatNumbers,
  );

  return seatLayout.seats.map((seat) => ({
    seatNumber: seat.seatNumber,
    seatType: seat.seatType,
    berthLevel: seat.berthLevel || null,
    ticketPrice: seat.ticketPrice,
    isBooked: bookedSeats.includes(seat.seatNumber),
  }));
};

