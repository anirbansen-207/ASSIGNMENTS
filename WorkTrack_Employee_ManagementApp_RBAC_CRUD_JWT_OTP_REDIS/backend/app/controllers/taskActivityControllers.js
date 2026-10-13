import {
  viewTaskActivitiesService,
} from "../services/taskActivityServices.js";

export const viewTaskActivitiesController = async (
  req,
  res,
) => {
  try {
    const activities =
      await viewTaskActivitiesService(
        req.params.taskId,
        req.user,
      );

    return res.status(200).json({
      success: true,
      message: "Task activity fetched successfully",
      data: activities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};