import Ticket from "../models/TicketGeneration.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

const generateTicketNumber = () => {
  return `GB-${Date.now()}-${Math.floor(
    100000 + Math.random() * 900000,
  )}`;
};

// Shared ticket data builder for customer and staff bookings.
const getTicketDetails = (booking) => {
  const trip = booking.tripId;
  const customer = booking.customerId;

  if (!trip || !trip.routeId || !trip.busId || !customer) {
    const error = new Error(
      "Customer, trip, route, or bus details are missing",
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    ticketNumber: generateTicketNumber(),
    bookingId: booking._id,
    customerId: customer._id || customer,
    customerName: customer.name,
    sourceCity: trip.routeId.sourceCity,
    destinationCity: trip.routeId.destinationCity,
    busNumber: trip.busId.busNumber,
    busName: trip.busId.busName,
    seatNumbers: booking.seatNumbers,
    travelDate: trip.travelDate,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    amount: booking.totalAmount,
    ticketStatus: "ACTIVE",
  };
};

// CREATE TICKET FOR CUSTOMER AFTER SUCCESSFUL ONLINE PAYMENT
export const createTicketService = async ({
  bookingId,
  customerId,
}) => {
  if (!bookingId || !customerId) {
    const error = new Error(
      "Booking ID and customer ID are required",
    );
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    customerId,
  })
    .populate("customerId", "name")
    .populate({
      path: "tripId",
      populate: [
        {
          path: "routeId",
          select: "sourceCity destinationCity",
        },
        {
          path: "busId",
          select: "busNumber busName",
        },
      ],
    });

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  if (booking.status !== "CONFIRMED") {
    const error = new Error(
      "Your booking must be confirmed before generating a ticket",
    );
    error.statusCode = 400;
    throw error;
  }

  // Online customer tickets require a successful payment.
  const payment = await Payment.findOne({
    bookingId: booking._id,
    customerId,
    paymentStatus: "SUCCESS",
  });

  if (!payment) {
    const error = new Error(
      "Successful payment is required before generating a ticket",
    );
    error.statusCode = 400;
    throw error;
  }

  // Return the ticket if this request is retried.
  const existingTicket = await Ticket.findOne({
    bookingId: booking._id,
  });

  if (existingTicket) {
    return existingTicket;
  }

  const ticketDetails = getTicketDetails(booking);

  try {
    return await Ticket.create(ticketDetails);
  } catch (error) {
    // Handle concurrent requests for the same booking.
    if (error.code === 11000) {
      const existingTicket = await Ticket.findOne({
        bookingId: booking._id,
      });

      if (existingTicket) {
        return existingTicket;
      }
    }

    throw error;
  }
};

// CREATE TICKET FOR BOOKING STAFF'S OFFLINE BOOKING
export const createStaffTicketService = async ({
  bookingId,
}) => {
  if (!bookingId) {
    const error = new Error("Booking ID is required");
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.findById(bookingId)
    .populate("customerId", "name")
    .populate({
      path: "tripId",
      populate: [
        {
          path: "routeId",
          select: "sourceCity destinationCity",
        },
        {
          path: "busId",
          select: "busNumber busName",
        },
      ],
    });

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  if (booking.status !== "CONFIRMED") {
    const error = new Error(
      "Only confirmed bookings can receive tickets",
    );
    error.statusCode = 400;
    throw error;
  }

  // Offline bookings do not require a Razorpay payment record.
  const existingTicket = await Ticket.findOne({
    bookingId: booking._id,
  });

  if (existingTicket) {
    return existingTicket;
  }

  const ticketDetails = getTicketDetails(booking);

  try {
    return await Ticket.create(ticketDetails);
  } catch (error) {
    if (error.code === 11000) {
      const existingTicket = await Ticket.findOne({
        bookingId: booking._id,
      });

      if (existingTicket) {
        return existingTicket;
      }
    }

    throw error;
  }
};
