
import {
  viewAdminActivityService,
} from "../services/adminActivityServices.js";

export const viewAdminActivityController = async (
  req,
  res,
) => {
  try {
    // Defense in depth: the route also has an admin-only permission.
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view the activity feed",
      });
    }

    const activities = await viewAdminActivityService({
      actorRole: req.query.actorRole,
      teamId: req.query.teamId,
      departmentId: req.query.departmentId,
      type: req.query.type,
      limit: req.query.limit,
    });

    return res.status(200).json({
      success: true,
      message: "Admin activity fetched successfully",
      data: activities,
    });
  } catch (error) {
    const statusCode =
      /invalid (team|department) filter/i.test(error.message)
        ? 400
        : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};
