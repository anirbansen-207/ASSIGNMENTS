import axiosInstance from "./axios";

// Fetch the complete activity history of a task.
export const getTaskActivitiesApi =
  async (taskId) => {
    const response =
      await axiosInstance.get(
        `/api/task-activity/${taskId}`,
      );

    return response.data.data;
  };