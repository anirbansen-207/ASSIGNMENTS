import axiosInstance from "./axios";

// Admin/Manager: create a new task.
export const createTaskApi = async (
  taskData,
) => {
  const response =
    await axiosInstance.post(
      "/api/task/create-task",
      taskData,
    );

  return response.data.data;
};

// Admin/Manager: fetch all tasks.
// Manager receives only tasks belonging to their own teams
// because that restriction is handled by the backend.
export const getAllTasksApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/task/all-tasks",
      );

    return response.data.data;
  };

// Admin/Manager/Employee: fetch one task.
// Backend decides whether the current user is allowed to see it.
export const getSingleTaskApi =
  async (taskId) => {
    const response =
      await axiosInstance.get(
        `/api/task/task-details/${taskId}`,
      );

    return response.data.data;
  };

// Admin/Manager: update task information.
export const updateTaskApi =
  async (
    taskId,
    taskData,
  ) => {
    const response =
      await axiosInstance.put(
        `/api/task/update-task/${taskId}`,
        taskData,
      );

    return response.data.data;
  };

// Admin/Manager: soft-delete a task.
export const deleteTaskApi =
  async (taskId) => {
    const response =
      await axiosInstance.delete(
        `/api/task/delete-task/${taskId}`,
      );

    return response.data.data;
  };

// Employee: fetch tasks assigned specifically to the logged-in employee.
export const getMyTasksApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/task/my-tasks",
      );

    return response.data.data;
  };

// Employee: fetch all tasks belonging to the employee's team.
export const getMyTeamTasksApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/task/my-team-tasks",
      );

    return response.data.data;
  };

// Employee: accept an assigned task.
export const acceptTaskApi =
  async (taskId) => {
    const response =
      await axiosInstance.patch(
        `/api/task/accept-task/${taskId}`,
      );

    return response.data.data;
  };

// Employee/Manager/Admin: update task status.
// The backend decides which statuses the current role is allowed to use.
export const updateTaskStatusApi =
  async (
    taskId,
    status,
  ) => {
    const response =
      await axiosInstance.patch(
        `/api/task/update-status/${taskId}`,
        { status },
      );

    return response.data.data;
  };

// Employee/Manager/Admin: update progress and optionally actual hours.
export const updateTaskProgressApi =
  async (
    taskId,
    progressData,
  ) => {
    const response =
      await axiosInstance.patch(
        `/api/task/update-progress/${taskId}`,
        progressData,
      );

    return response.data.data;
  };