import {
  createTaskService,
  viewAllTasksService,
  viewSingleTaskService,
  updateTaskService,
  deleteTaskService,
  viewMyTasksService,
  viewMyTeamTasksService,
  acceptTaskService,
  updateTaskStatusService,
  updateTaskProgressService,
} from "../services/taskServices.js";

export const createTaskController = async (req, res) => {
  try {
    const task = await createTaskService(
      req.body,
      req.user._id,
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewAllTasksController = async (req, res) => {
  try {
    const tasks = await viewAllTasksService(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewSingleTaskController = async (req, res) => {
  try {
    const task = await viewSingleTaskService(
      req.params.taskId,
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTaskController = async (req, res) => {
  try {
    const task = await updateTaskService(
      req.params.taskId,
      req.body,
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTaskController = async (req, res) => {
  try {
    const task = await deleteTaskService(
      req.params.taskId,
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewMyTasksController = async (req, res) => {
  try {
    const tasks = await viewMyTasksService(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Your tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const viewMyTeamTasksController = async (req, res) => {
  try {
    const tasks = await viewMyTeamTasksService(
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: "Team tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const acceptTaskController = async (req, res) => {
  try {
    const task = await acceptTaskService(
      req.params.taskId,
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: "Task accepted successfully",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTaskStatusController = async (req, res) => {
  try {
    const task = await updateTaskStatusService(
      req.params.taskId,
      req.body.status,
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTaskProgressController = async (
  req,
  res,
) => {
  try {
    const task = await updateTaskProgressService(
      req.params.taskId,
      req.body,
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: "Task progress updated successfully",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};