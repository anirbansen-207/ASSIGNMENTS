import Trip from "../models/Trip.js";
import Route from "../models/Route.js";
import Bus from "../models/Bus.js";
import Driver from "../models/Driver.js";
import Booking from "../models/Booking.js";
import Ticket from "../models/TicketGeneration.js";

// CREATE TRIP
export const createTripService = async ({
  routeId,
  busId,
  driverId,
  travelDate,
  departureTime,
  arrivalTime,
  estimatedTravelTime,
  createdBy,
}) => {
  try {
    // Check Route
    const route = await Route.findOne({
      _id: routeId,
      routeStatus: "ACTIVE",
    });

    if (!route) {
      const error = new Error("Active route not found");
      error.statusCode = 404;
      throw error;
    }

    // Check Bus
    const bus = await Bus.findOne({
      _id: busId,
      isActive: true,
    });

    if (!bus) {
      const error = new Error("Active bus not found");
      error.statusCode = 404;
      throw error;
    }

    // Check Driver
    const driver = await Driver.findOne({
      _id: driverId,
      isActive: true,
    });

    if (!driver) {
      const error = new Error("Active driver not found");
      error.statusCode = 404;
      throw error;
    }

    // Departure must be before arrival
    if (new Date(departureTime) >= new Date(arrivalTime)) {
      const error = new Error(
        "Departure time must be before arrival time",
      );

      error.statusCode = 400;
      throw error;
    }

    // Check Bus conflict
    const busConflict = await Trip.findOne({
      busId,
      tripStatus: {
        $in: ["SCHEDULED", "ONGOING"],
      },
      departureTime: {
        $lt: new Date(arrivalTime),
      },
      arrivalTime: {
        $gt: new Date(departureTime),
      },
    });

    if (busConflict) {
      const error = new Error(
        "Bus is already assigned to another trip during this time",
      );

      error.statusCode = 400;
      throw error;
    }

    // Check Driver conflict
    const driverConflict = await Trip.findOne({
      driverId,
      tripStatus: {
        $in: ["SCHEDULED", "ONGOING"],
      },
      departureTime: {
        $lt: new Date(arrivalTime),
      },
      arrivalTime: {
        $gt: new Date(departureTime),
      },
    });

    if (driverConflict) {
      const error = new Error(
        "Driver is already assigned to another trip during this time",
      );

      error.statusCode = 400;
      throw error;
    }

    // Create Trip
    const trip = await Trip.create({
      routeId,
      busId,
      driverId,
      travelDate,
      departureTime,
      arrivalTime,
      estimatedTravelTime,
      createdBy,
    });

    return trip;
  } catch (error) {
    throw error;
  }
};

// GET ALL TRIPS
export const getAllTripsService = async () => {
  try {
    const trips = await Trip.find({ isDeleted: { $ne: true } })
      .populate(
        "routeId",
        "sourceCity destinationCity routeDistance routeStatus",
      )
      .populate(
        "busId",
        "busNumber busName busType totalSeats availableSeats",
      )
      .populate(
        "driverId",
        "name email phone",
      )
      .populate(
        "createdBy",
        "name email",
      )
      .sort({ departureTime: 1 });

    return trips;
  } catch (error) {
    throw error;
  }
};

// GET SINGLE TRIP
export const getSingleTripService = async (tripId) => {
  try {
    const trip = await Trip.findById(tripId)
      .populate(
        "routeId",
        "sourceCity destinationCity routeDistance routeStatus",
      )
      .populate(
        "busId",
        "busNumber busName busType totalSeats availableSeats",
      )
      .populate(
        "driverId",
        "name email phone",
      )
      .populate(
        "createdBy",
        "name email",
      );

    if (!trip) {
      const error = new Error("Trip not found");
      error.statusCode = 404;
      throw error;
    }

    return trip;
  } catch (error) {
    throw error;
  }
};

// UPDATE TRIP
export const updateTripService = async (
  tripId,
  updateData,
) => {
  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      const error = new Error("Trip not found");
      error.statusCode = 404;
      throw error;
    }

    // Don't update completed or cancelled trips
    if (
      trip.tripStatus === "COMPLETED" ||
      trip.tripStatus === "CANCELLED"
    ) {
      const error = new Error(
        "Trip is already completed or cancelled",
      );

      error.statusCode = 400;
      throw error;
    }

    const routeId =
      updateData.routeId || trip.routeId;

    const busId =
      updateData.busId || trip.busId;

    const driverId =
      updateData.driverId || trip.driverId;

    const departureTime =
      updateData.departureTime || trip.departureTime;

    const arrivalTime =
      updateData.arrivalTime || trip.arrivalTime;

    // Check Route
    const route = await Route.findOne({
      _id: routeId,
      routeStatus: "ACTIVE",
    });

    if (!route) {
      const error = new Error("Route not found");
      error.statusCode = 404;
      throw error;
    }

    // Check Bus
    const bus = await Bus.findOne({
      _id: busId,
      isActive: true,
    });

    if (!bus) {
      const error = new Error("Bus not found");
      error.statusCode = 404;
      throw error;
    }

    // Check Driver
    const driver = await Driver.findOne({
      _id: driverId,
      isActive: true,
    });

    if (!driver) {
      const error = new Error("Driver not found");
      error.statusCode = 404;
      throw error;
    }

    // Check time
    if (
      new Date(departureTime) >=
      new Date(arrivalTime)
    ) {
      const error = new Error(
        "Arrival time must be greater than departure time",
      );

      error.statusCode = 400;
      throw error;
    }

    // Check Bus conflict
    const busConflict = await Trip.findOne({
      _id: { $ne: tripId },
      busId,
      tripStatus: {
        $in: ["SCHEDULED", "ONGOING"],
      },
      departureTime: {
        $lt: new Date(arrivalTime),
      },
      arrivalTime: {
        $gt: new Date(departureTime),
      },
    });

    if (busConflict) {
      const error = new Error(
        "Bus is already assigned to another trip during this time",
      );

      error.statusCode = 400;
      throw error;
    }

    // Check Driver conflict
    const driverConflict = await Trip.findOne({
      _id: { $ne: tripId },
      driverId,
      tripStatus: {
        $in: ["SCHEDULED", "ONGOING"],
      },
      departureTime: {
        $lt: new Date(arrivalTime),
      },
      arrivalTime: {
        $gt: new Date(departureTime),
      },
    });

    if (driverConflict) {
      const error = new Error(
        "Driver is already assigned to another trip during this time",
      );

      error.statusCode = 400;
      throw error;
    }

    const updatedTrip =
      await Trip.findByIdAndUpdate(
        tripId,
        updateData,
        {
          new: true,
          runValidators: true,
        },
      )
        .populate(
          "routeId",
          "sourceCity destinationCity routeDistance routeStatus",
        )
        .populate(
          "busId",
          "busNumber busName busType totalSeats availableSeats",
        )
        .populate(
          "driverId",
          "name email phone",
        )
        .populate(
          "createdBy",
          "name email",
        );

    return updatedTrip;
  } catch (error) {
    throw error;
  }
};

// UPDATE TRIP STATUS
export const updateTripStatusService = async (
  tripId,
  newStatus,
) => {
  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      const error = new Error("Trip not found");
      error.statusCode = 404;
      throw error;
    }

    // Final states
    if (
      trip.tripStatus === "COMPLETED" ||
      trip.tripStatus === "CANCELLED"
    ) {
      const error = new Error(
        "Trip is already completed or cancelled",
      );

      error.statusCode = 400;
      throw error;
    }

    const allowedTransitions = {
      SCHEDULED: ["ONGOING"],
      ONGOING: ["COMPLETED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (
      !allowedTransitions[trip.tripStatus].includes(
        newStatus,
      )
    ) {
      const error = new Error(
        `Cannot change trip status from ${trip.tripStatus} to ${newStatus}`,
      );

      error.statusCode = 400;
      throw error;
    }

    trip.tripStatus = newStatus;

    await trip.save();

    return trip;
  } catch (error) {
    throw error;
  }
};

// CANCEL TRIP
export const cancelTripService = async (tripId) => {
  try {
    const trip = await Trip.findById(tripId);

    if (!trip) {
      const error = new Error("Trip not found");
      error.statusCode = 404;
      throw error;
    }

    // Completed/cancelled trips cannot be cancelled again
    if (
      trip.tripStatus === "COMPLETED" ||
      trip.tripStatus === "CANCELLED"
    ) {
      const error = new Error(
        "Trip is already completed or cancelled",
      );

      error.statusCode = 400;
      throw error;
    }

    // Find confirmed bookings
    const confirmedBookings = await Booking.find({
      tripId,
      status: "CONFIRMED",
    }).select("_id");

    const bookingIds = confirmedBookings.map(
      (booking) => booking._id,
    );

    // Cancel all confirmed bookings
    await Booking.updateMany(
      {
        tripId,
        status: "CONFIRMED",
      },
      {
        status: "CANCELLED",
      },
    );

    // Cancel active tickets
    if (bookingIds.length > 0) {
      await Ticket.updateMany(
        {
          bookingId: {
            $in: bookingIds,
          },
          ticketStatus: "ACTIVE",
        },
        {
          ticketStatus: "CANCELLED",
        },
      );
    }

    // Finally cancel trip
    trip.tripStatus = "CANCELLED";

    await trip.save();

    return trip;
  } catch (error) {
    throw error;
  }
};

// COMPLETED TRIP HISTORY
export const getCompletedTripsService = async () => {
  try {
    const completedTrips = await Trip.find({
      tripStatus: "COMPLETED",
      isDeleted: { $ne: true },
    })
      .populate(
        "routeId",
        "sourceCity destinationCity routeDistance",
      )
      .populate(
        "busId",
        "busNumber busName busType",
      )
      .populate(
        "driverId",
        "name email phone",
      )
      .sort({ arrivalTime: -1 });

    return completedTrips;
  } catch (error) {
    throw error;
  }
};

// SOFT DELETE A COMPLETED OR CANCELLED TRIP
// Booking and ticket records remain available for historical lookups.
export const deleteTripService = async (tripId) => {
  const trip = await Trip.findById(tripId);

  if (!trip || trip.isDeleted) {
    const error = new Error("Trip not found");
    error.statusCode = 404;
    throw error;
  }

  if (!["COMPLETED", "CANCELLED"].includes(trip.tripStatus)) {
    const error = new Error(
      "Only completed or cancelled trips can be deleted",
    );
    error.statusCode = 400;
    throw error;
  }

  trip.isDeleted = true;
  await trip.save();

  return { tripId: trip._id, isDeleted: true };
};
