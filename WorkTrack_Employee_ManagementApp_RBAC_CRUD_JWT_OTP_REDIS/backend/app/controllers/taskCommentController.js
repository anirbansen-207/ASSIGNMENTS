import {
  createTaskCommentService,
  viewTaskCommentsService,
} from "../services/taskCommentServices.js";



// Create Task Comment controller
export const createTaskCommentController = async (
  req,
  res,
) => {
  try {
    const comment = await createTaskCommentService(
      req.params.taskId,
      req.body.comment,
      req.user,
    );

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




// View Task Comments controller 
export const viewTaskCommentsController = async (
  req,
  res,
) => {
  try {
    const comments = await viewTaskCommentsService(
      req.params.taskId,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Task comments fetched successfully",
      data: comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};