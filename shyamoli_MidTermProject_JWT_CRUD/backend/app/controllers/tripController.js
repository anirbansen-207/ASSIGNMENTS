import { createTripService,
  getAllTripsService,
  getSingleTripService,
  updateTripService,
  updateTripStatusService,
  cancelTripService,
  getCompletedTripsService,
  deleteTripService,
 } from "../services/tripService.js";
import { successResponse } from "../utils/response.js";



// create trip controller
export const createTripController = async (req, res, next) => {
  try {

    const { userId: createdBy } = req.user;

    const {
      routeId,
      busId,
      driverId,
      travelDate,
      departureTime,
      arrivalTime,
      estimatedTravelTime,
    } = req.body;


    const trip = await createTripService({
      routeId,
      busId,
      driverId,
      travelDate,
      departureTime,
      arrivalTime,
      estimatedTravelTime,
      createdBy,
    });


    return successResponse(
      res,
      201,
      "Trip created successfully",
      trip
    );

  } catch (error) {
    next(error);
  }
};

// get all trips controller
export const getAllTripsController = async (req, res, next) => {
  try {
    const trips = await getAllTripsService();

    return successResponse(
      res,
      200,
      "All trips fetched successfully",
      trips
    );
  } catch (error) {
    next(error);
  }
};

// Get Single Trip controller
export const getSingleTripController = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    const trip = await getSingleTripService(tripId);

    return successResponse(
      res,
      200,
      "Single trip fetched successfully",
      trip
    );
  } catch (error) {
    next(error);
  }
};

// update trip controller
export const updateTripController = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    const updatedTrip = await updateTripService(tripId, req.body);

    return successResponse(
      res,
      200,
      "Trip updated successfully",
      updatedTrip
    );
  } catch (error) {
    next(error);
  }
};

// update trip status controller
export const updateTripStatusController = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { tripStatus } = req.body;

    const updatedTrip = await updateTripStatusService(tripId, tripStatus);

    return successResponse(
      res,
      200,
      "Trip status updated successfully",
      updatedTrip
    );
  } catch (error) {
    next(error);
  }
};

// cancel trip controller
export const cancelTripController = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    const cancelledTrip = await cancelTripService(tripId);

    return successResponse(
      res,
      200,
      "Trip cancelled successfully",
      cancelledTrip
    );
  } catch (error) {
    next(error);
  }
};


// get completed trips controller
export const getCompletedTripsController = async (
  req,
  res,
  next
) => {
  try {
    const completedTrips =
      await getCompletedTripsService();

    return successResponse(
      res,
      200,
      "Completed trip history fetched successfully",
      completedTrips
    );
  } catch (error) {
    next(error);
  }
};

// Delete (soft-delete) a completed or cancelled trip.
export const deleteTripController = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const result = await deleteTripService(tripId);

    return successResponse(res, 200, "Trip deleted successfully", result);
  } catch (error) {
    next(error);
  }
};
