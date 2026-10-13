import axiosInstance from "./axios";

// Fetch every notification belonging to the logged-in user.
export const getMyNotificationsApi = async () => {
  const response = await axiosInstance.get(
    "/api/notification/my-notifications",
  );

  return response.data.data;
};

// Fetch only unread notifications.
export const getUnreadNotificationsApi = async () => {
  const response = await axiosInstance.get("/api/notification/unread");

  return response.data.data;
};

// Mark one notification as read.
export const markNotificationReadApi = async (notificationId) => {
  const response = await axiosInstance.patch(
    `/api/notification/read/${notificationId}`,
  );

  return response.data.data;
};

// Mark every notification as read.
export const markAllNotificationsReadApi = async () => {
  const response = await axiosInstance.patch("/api/notification/read-all");

  return response.data.data;
};

// Fetch activity notifications for the admin monitoring page.
export const getAdminActivityNotificationsApi = async (params = {}) => {
  const response = await axiosInstance.get("/api/notification/admin/activity", {
    params,
  });

  return {
    notifications: response.data.data || [],
    pagination: response.data.pagination,
  };
};
