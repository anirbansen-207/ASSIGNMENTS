import axiosInstance from "./axios";

// Add a new comment to a task.
export const addTaskCommentApi =
  async (
    taskId,
    comment,
  ) => {
    const response =
      await axiosInstance.post(
        `/api/task-comment/add-comment/${taskId}`,
        {
          comment,
        },
      );

    return response.data.data;
  };

// Fetch all comments belonging to a task.
export const getTaskCommentsApi =
  async (taskId) => {
    const response =
      await axiosInstance.get(
        `/api/task-comment/task-comments/${taskId}`,
      );

    return response.data.data;
  };