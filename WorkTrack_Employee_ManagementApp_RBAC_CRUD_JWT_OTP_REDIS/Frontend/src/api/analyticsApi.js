
import axiosInstance from "./axios";

// Fetch analytics according to the logged-in user's role.
// The backend automatically decides whether the user is
// an admin, manager, or employee.
export const getAnalyticsOverviewApi = async () => {
  const response = await axiosInstance.get(
    "/api/analytics/overview",
  );

  return response.data.data;
};
