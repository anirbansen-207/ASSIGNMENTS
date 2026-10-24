import Route from "../models/Route.js";
import Trip from "../models/Trip.js";

// CREATE ROUTE
export const createRouteService = async ({
  sourceCity,
  destinationCity,
  intermediateStops,
  boardingPoints,
  droppingPoints,
  routeDistance,
  routeStatus,
  createdBy,
}) => {
  try {
    const existingRoute = await Route.findOne({ sourceCity, destinationCity });

    if (existingRoute) {
      const error = new Error("Route already exists between these cities");
      error.statusCode = 409;
      throw error;
    }

    return await Route.create({
      sourceCity,
      destinationCity,
      intermediateStops,
      boardingPoints,
      droppingPoints,
      routeDistance,
      routeStatus,
      createdBy,
    });
  } catch (error) {
    throw error;
  }
};

// GET ALL ROUTES
export const getAllRoutesService = async () => {
  try {
    return await Route.find();
  } catch (error) {
    throw error;
  }
};

// GET SINGLE ROUTE
export const getSingleRouteService = async (routeId) => {
  try {
    const route = await Route.findById(routeId);
    if (!route) {
      const error = new Error("Route not found");
      error.statusCode = 404;
      throw error;
    }
    return route;
  } catch (error) {
    throw error;
  }
};

// UPDATE ROUTE
export const updateRouteService = async (routeId, updateData) => {
  try {
    const route = await Route.findById(routeId);
    if (!route) {
      const error = new Error("Route not found");
      error.statusCode = 404;
      throw error;
    }
    return await Route.findByIdAndUpdate(routeId, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    throw error;
  }
};

// DELETE ROUTE
export const deleteRouteService = async (routeId) => {
  try {
    const route = await Route.findById(routeId);
    if (!route) {
      const error = new Error("Route not found");
      error.statusCode = 404;
      throw error;
    }

    // Only scheduled or ongoing trips prevent route deletion.
    // Completed/cancelled trips are historical records and do not block deletion.
    const activeTrip = await Trip.findOne({
      routeId,
      tripStatus: { $in: ["SCHEDULED", "ONGOING"] },
    });

    if (activeTrip) {
      const error = new Error(
        "Route cannot be deleted because it is used by a scheduled or ongoing trip. Complete or cancel that trip first.",
      );
      error.statusCode = 400;
      throw error;
    }

    await Route.findByIdAndDelete(routeId);
    return route;
  } catch (error) {
    throw error;
  }
};
