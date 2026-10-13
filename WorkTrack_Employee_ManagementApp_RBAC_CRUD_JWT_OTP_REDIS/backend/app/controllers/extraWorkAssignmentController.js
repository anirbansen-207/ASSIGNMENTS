
import {
  createExtraWorkAssignmentService,
  getManagerExtraWorkAssignmentsService,
  getMyExtraWorkAssignmentsService,
  acceptExtraWorkAssignmentService,
  rejectExtraWorkAssignmentService,
  deleteExtraWorkAssignmentService,
} from "../services/extraWorkAssignmentServices.js";

const sendError = (res, error) => {
  const message = error?.message || "Extra-duty operation failed";

  const status = /not authorized|not allowed|unauthorized/i.test(message)
    ? 403
    : /not found/i.test(message)
      ? 404
      : /already|pending|active|processed|no longer available/i.test(message)
        ? 409
        : /invalid|must|valid|between|selected|duration/i.test(message)
          ? 400
          : 500;

  return res.status(status).json({
    success: false,
    message,
  });
};

export const createExtraWorkAssignmentController = async (req, res) => {
  try {
    const result = await createExtraWorkAssignmentService(
      req.user._id,
      req.body,
    );

    return res.status(201).json({
      success: true,
      message: `Extra duty assigned to ${result.assignedCount} employee(s)`,
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getManagerExtraWorkAssignmentsController = async (req, res) => {
  try {
    const assignments = await getManagerExtraWorkAssignmentsService(
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getMyExtraWorkAssignmentsController = async (req, res) => {
  try {
    const assignments = await getMyExtraWorkAssignmentsService(req.user._id);

    return res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const acceptExtraWorkAssignmentController = async (req, res) => {
  try {
    const assignment = await acceptExtraWorkAssignmentService(
      req.user._id,
      req.params.assignmentId,
    );

    return res.status(200).json({
      success: true,
      message: "Extra duty accepted. Extra-duty attendance has started.",
      data: assignment,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const rejectExtraWorkAssignmentController = async (req, res) => {
  try {
    const assignment = await rejectExtraWorkAssignmentService(
      req.user._id,
      req.params.assignmentId,
    );

    return res.status(200).json({
      success: true,
      message: "Extra-duty assignment declined",
      data: assignment,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const deleteExtraWorkAssignmentController = async (req, res) => {
  try {
    const assignment = await deleteExtraWorkAssignmentService(
      req.user._id,
      req.params.assignmentId,
    );

    return res.status(200).json({
      success: true,
      message: "Extra-task assignment deleted successfully",
      data: assignment,
    });
  } catch (error) {
    const message =
      error?.message || "Could not delete extra-task assignment";

    const status = /not authorized|not allowed|unauthorized/i.test(message)
      ? 403
      : /not found/i.test(message)
        ? 404
        : /already started|completed|cannot delete|active session/i.test(message)
          ? 409
          : /invalid/i.test(message)
            ? 400
            : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};