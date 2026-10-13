import axiosInstance from "./axios";

// Employee submits a new leave request.
export const createLeaveApi =
  async (leaveData) => {
    const response =
      await axiosInstance.post(
        "/api/leave/create-leave",
        leaveData,
      );

    return response.data.data;
  };

// Employee fetches their own leave history.
export const getMyLeavesApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/leave/my-leaves",
      );

    return response.data.data;
  };

// Employee fetches their current leave balances.
export const getMyLeaveBalanceApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/leave/my-balance",
      );

    return response.data.data;
  };

// Manager fetches leave requests belonging to their team.
export const getTeamLeavesApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/leave/team-leaves",
      );

    return response.data.data;
  };

// Manager approves or rejects a leave request.
export const reviewLeaveApi =
  async (
    leaveId,
    reviewData,
  ) => {
    const response =
      await axiosInstance.patch(
        `/api/leave/review/${leaveId}`,
        reviewData,
      );

    return response.data.data;
  };

// Admin fetches every leave request.
export const getAllLeavesApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/leave/all-leaves",
      );

    return response.data.data;
  };

// Admin creates or updates an employee's leave balance.
export const setLeaveBalanceApi =
  async (balanceData) => {
    const response =
      await axiosInstance.post(
        "/api/leave/set-balance",
        balanceData,
      );

    return response.data.data;
  };

// Admin fetches approved leaves for the complete organization.
export const getLeaveCalendarApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/leave/calendar",
      );

    return response.data.data;
  };

// Manager fetches approved leaves belonging to their team.
export const getTeamLeaveCalendarApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/leave/team-calendar",
      );

    return response.data.data;
  };