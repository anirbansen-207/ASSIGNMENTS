import express from "express";

import {
  createBookingController,
  getAllBookingsController,
  getSingleBookingController,
  cancelBookingController,
  getAvailableSeatsController,
} from "../controllers/bookingController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { ROLES } from "../utils/roles.js";

import { validateMiddleware } from "../middlewares/validationMiddleware.js";

import { createBookingSchema } from "../validations/bookingValidation.js";

const router = express.Router();


// CREATE BOOKING
// Customer → creates booking for himself
// Booking Staff → creates booking for a customer
router.post(
  "/create_booking",
  authMiddleware,
  roleMiddleware([
    ROLES.CUSTOMER,
    ROLES.BOOKING_STAFF,
  ]),
  validateMiddleware(createBookingSchema),
  createBookingController
);


// ALL BOOKINGS
router.get(
  "/all_bookings",
  authMiddleware,
  roleMiddleware([
    ROLES.SUPER_ADMIN,
    ROLES.BOOKING_STAFF,
  ]),
  getAllBookingsController
);


// SINGLE BOOKING
router.get(
  "/single_booking/:bookingId",
  authMiddleware,
  roleMiddleware([
    ROLES.SUPER_ADMIN,
    ROLES.BOOKING_STAFF,
    ROLES.CUSTOMER,
  ]),
  getSingleBookingController
);


// CANCEL BOOKING
router.patch(
  "/cancel_booking/:bookingId",
  authMiddleware,
  roleMiddleware([
    ROLES.SUPER_ADMIN,
    ROLES.CUSTOMER,
    ROLES.BOOKING_STAFF,
  ]),
  cancelBookingController
);


// AVAILABLE SEATS
router.get(
  "/available_seats/:tripId",
  authMiddleware,
  roleMiddleware([
    ROLES.SUPER_ADMIN,
    ROLES.CUSTOMER,
    ROLES.BOOKING_STAFF,
  ]),
  getAvailableSeatsController
);

export default router;