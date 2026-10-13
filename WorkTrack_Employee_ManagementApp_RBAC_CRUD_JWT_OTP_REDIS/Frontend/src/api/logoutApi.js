import axiosInstance from "./axios";

// logout API
export const logoutApi = async () => {
  const response = await axiosInstance.post("/api/auth/logout");

  return response.data;
};
