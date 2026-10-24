
import {
  createBusService,
  getAllBusService,
  getSingleBusService,
  updateBusService,
  deleteBusService,
  getBusDetailsByBusNumberService,
  adjustBusSeatService,
} from "../services/busService.js";

import { successResponse } from "../utils/response.js";

// CREATE BUS
export const createBusController = async (req, res, next) => {
  try {
    const {
      busNumber,
      busType,
      totalSeats,
      ticketPrice,
    } = req.body;

    const bus = await createBusService({
      busNumber,
      busType,
      totalSeats,
      ticketPrice,
      createdBy: req.user.userId,
    });

    return successResponse(
      res,
      201,
      "Bus created successfully",
      bus,
    );
  } catch (error) {
    next(error);
  }
};

// VIEW ALL BUSES
export const getAllBusController = async (req, res, next) => {
  try {
    const allBus = await getAllBusService();

    return successResponse(
      res,
      200,
      "Buses fetched successfully",
      allBus,
    );
  } catch (error) {
    next(error);
  }
};

// VIEW SINGLE BUS
export const getSingleBusController = async (req, res, next) => {
  try {
    const singleBus = await getSingleBusService(req.params.busId);

    return successResponse(
      res,
      200,
      "Bus fetched successfully",
      singleBus,
    );
  } catch (error) {
    next(error);
  }
};

// UPDATE BUS
export const updateBusController = async (req, res, next) => {
  try {
    const updatedBus = await updateBusService(
      req.params.busId,
      req.body,
    );

    return successResponse(
      res,
      200,
      "Bus updated successfully",
      updatedBus,
    );
  } catch (error) {
    next(error);
  }
};

// DELETE BUS
export const deleteBusController = async (req, res, next) => {
  try {
    const deletedBus = await deleteBusService(req.params.busId);

    return successResponse(
      res,
      200,
      "Bus deleted successfully",
      deletedBus,
    );
  } catch (error) {
    next(error);
  }
};

// GET BUS BY NUMBER
export const getBusDetailsByBusNumberController = async (
  req,
  res,
  next,
) => {
  try {
    const busByNumber = await getBusDetailsByBusNumberService(
      req.params.busNumber,
    );

    return successResponse(
      res,
      200,
      "Bus fetched successfully by bus number",
      busByNumber,
    );
  } catch (error) {
    next(error);
  }
};

// ADJUST BUS SEATS
export const adjustBusSeatController = async (req, res, next) => {
  try {
    const busByNumber = await adjustBusSeatService(
      req.params.busNumber,
      req.body.totalSeats,
    );

    return successResponse(
      res,
      200,
      "Bus seat adjusted successfully",
      busByNumber,
    );
  } catch (error) {
    next(error);
  }
};
