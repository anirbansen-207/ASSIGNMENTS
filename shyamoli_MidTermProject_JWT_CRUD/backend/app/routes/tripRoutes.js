import express from "express";

import {
  createTripController,
  getAllTripsController,
  getSingleTripController,
  updateTripController,
  updateTripStatusController,
  cancelTripController,
  getCompletedTripsController,
  deleteTripController,
} from "../controllers/tripController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

import { ROLES } from "../utils/roles.js";

import { validateMiddleware } from "../middlewares/validationMiddleware.js";

import {
  createTripSchema,
  updateTripSchema,
  updateTripStatusSchema,
} from "../validations/tripValidation.js";

const router = express.Router();

// CREATE TRIP
router.post(
  "/create_trip",
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN]),
  validateMiddleware(createTripSchema),
  createTripController,
);

// ALL TRIPS
router.get(
  "/all_trips",
  authMiddleware,
  roleMiddleware([
    ROLES.SUPER_ADMIN,
    ROLES.BOOKING_STAFF,
    ROLES.DRIVER,
    ROLES.CUSTOMER,
  ]),
  getAllTripsController,
);

// SINGLE TRIP
router.get(
  "/single_trip/:tripId",
  authMiddleware,
  roleMiddleware([
    ROLES.SUPER_ADMIN,
    ROLES.BOOKING_STAFF,
    ROLES.DRIVER,
    ROLES.CUSTOMER,
  ]),
  getSingleTripController,
);

// UPDATE TRIP
router.put(
  "/update_trip/:tripId",
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN]),
  validateMiddleware(updateTripSchema),
  updateTripController,
);

// UPDATE TRIP STATUS
router.patch(
  "/update_status/:tripId",
  authMiddleware,
  roleMiddleware([
    ROLES.SUPER_ADMIN,
    ROLES.BOOKING_STAFF,
  ]),
  validateMiddleware(updateTripStatusSchema),
  updateTripStatusController,
);

// CANCEL TRIP
router.patch(
  "/cancel_trip/:tripId",
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN]),
  cancelTripController,
);

// DELETE COMPLETED OR CANCELLED TRIP
router.delete(
  "/delete_trip/:tripId",
  authMiddleware,
  roleMiddleware([ROLES.SUPER_ADMIN]),
  deleteTripController,
);

// COMPLETED TRIPS
router.get(
  "/completed_trips",
  authMiddleware,
  roleMiddleware([
    ROLES.SUPER_ADMIN,
    ROLES.BOOKING_STAFF,
  ]),
  getCompletedTripsController,
);

export default router;