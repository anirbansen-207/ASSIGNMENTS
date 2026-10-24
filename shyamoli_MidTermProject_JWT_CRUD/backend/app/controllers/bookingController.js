import {
  createBookingService,
  getAllBookingService,
  getSingleBookingService,
  cancelBookingService,
  getAvailableSeatsService,
} from "../services/bookingService.js";

import { successResponse } from "../utils/response.js";
import { ROLES } from "../utils/roles.js";

// Create booking
export const createBookingController = async (req, res, next) => {
  try {
    // Get logged-in user's id and role
    const { userId, role } = req.user;

    // Get booking data from request body
    const { tripId, seatNumbers, customerId: requestedCustomerId } = req.body;

    /*
      Customer:
      customerId comes from logged-in user

      Booking Staff:
      customerId comes from request body
      because staff is creating booking
      for a customer
    */
    const customerId =
      role === ROLES.BOOKING_STAFF ? requestedCustomerId : userId;

    // Booking staff must provide customerId
    if (role === ROLES.BOOKING_STAFF && !requestedCustomerId) {
      const error = new Error(
        "Customer ID is required for booking staff booking",
      );
      error.statusCode = 400;
      throw error;
    }

    const bookingStatus =
      role === ROLES.BOOKING_STAFF ? "CONFIRMED" : "PENDING_PAYMENT";

    const booking = await createBookingService({
      customerId,
      tripId,
      seatNumbers,
      bookingStatus,
    });

    return successResponse(res, 201, "Booking created successfully", booking);
  } catch (error) {
    next(error);
  }
};

// Get all bookings
export const getAllBookingsController = async (req, res, next) => {
  try {
    const allBookings = await getAllBookingService();

    return successResponse(
      res,
      200,
      "All bookings fetched successfully",
      allBookings,
    );
  } catch (error) {
    next(error);
  }
};

// Get single booking
export const getSingleBookingController = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { userId, role } = req.user;

    let customerId;

    // Customer can only see own booking
    if (role === ROLES.CUSTOMER) {
      customerId = userId;
    }

    const singleBooking = await getSingleBookingService(bookingId, customerId);

    return successResponse(
      res,
      200,
      "Single booking fetched successfully",
      singleBooking,
    );
  } catch (error) {
    next(error);
  }
};

// Cancel booking
// Cancel booking controller
export const cancelBookingController = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    // Get logged-in user's ID and role
    const { userId, role } = req.user;

    // Customer cancels their own booking.
    // Booking Staff can cancel any customer's booking.
    const customerId = role === ROLES.CUSTOMER ? userId : undefined;

    const cancelledBooking = await cancelBookingService({
      bookingId,
      customerId,
    });

    return successResponse(
      res,
      200,
      "Booking cancelled successfully",
      cancelledBooking,
    );
  } catch (error) {
    next(error);
  }
};

// Get available seats
export const getAvailableSeatsController = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    const seats = await getAvailableSeatsService(tripId);

    return successResponse(
      res,
      200,
      "Available seats fetched successfully",
      seats,
    );
  } catch (error) {
    next(error);
  }
};
