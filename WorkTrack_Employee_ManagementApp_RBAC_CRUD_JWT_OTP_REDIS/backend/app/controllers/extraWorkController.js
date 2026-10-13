
import {
  requestExtraWorkService,
  getMyExtraWorkRequestsService,
  getPendingExtraWorkRequestsService,
  decideExtraWorkRequestService,
  checkOutExtraWorkService,
  getExtraTimeSummaryService,
  getAllExtraWorkRecordsService,
} from "../services/extraWorkServices.js";

const sendError = (res, error) => {
  const message = error?.message || "Extra-work request failed";

  const status = /not authorized|not allowed|unauthorized/i.test(message)
    ? 403
    : /not found/i.test(message)
      ? 404
      : /already|pending|active|processed|outside|inside your scheduled|shift/i.test(message)
        ? 409
        : /invalid|must|please provide|required|duration|reason/i.test(message)
          ? 400
          : 500;

  return res.status(status).json({
    success: false,
    message,
  });
};

export const requestExtraWorkController = async (req, res) => {
  try {
    const request = await requestExtraWorkService(
      req.user._id,
      req.body.reason,
    );

    return res.status(201).json({
      success: true,
      message: "Please wait for your manager's approval",
      data: request,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getMyExtraWorkRequestsController = async (req, res) => {
  try {
    const requests = await getMyExtraWorkRequestsService(req.user._id);

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getPendingExtraWorkRequestsController = async (req, res) => {
  try {
    const requests = await getPendingExtraWorkRequestsService(req.user._id);

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const decideExtraWorkRequestController = async (req, res) => {
  try {
    const request = await decideExtraWorkRequestService(
      req.user._id,
      req.params.requestId,
      req.params.decision,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: `Extra-work request ${req.params.decision} processed successfully`,
      data: request,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const checkOutExtraWorkController = async (req, res) => {
  try {
    const session = await checkOutExtraWorkService(
      req.user._id,
      req.params.requestId,
    );

    return res.status(200).json({
      success: true,
      message: "Extra-work session checked out successfully",
      data: session,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getExtraTimeSummaryController = async (req, res) => {
  try {
    const summary = await getExtraTimeSummaryService(req.user._id);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getAllExtraWorkRecordsController = async (req, res) => {
  try {
    const records = await getAllExtraWorkRecordsService({
      from: req.query.from,
      to: req.query.to,
      teamId: req.query.teamId,
      managerId: req.query.managerId,
      status: req.query.status,
    });

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    const message = error?.message || "Could not load extra-work records";

    const status = /invalid|cannot be after/i.test(message) ? 400 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};