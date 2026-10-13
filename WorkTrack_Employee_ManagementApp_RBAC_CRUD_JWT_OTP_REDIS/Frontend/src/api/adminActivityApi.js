
import axiosInstance from "./axios";

export const getAdminActivityApi = async (filters = {}) => {
  const params = {};

  if (filters.actorRole) {
    params.actorRole = filters.actorRole;
  }

  if (filters.teamId) {
    params.teamId = filters.teamId;
  }

  if (filters.departmentId) {
    params.departmentId = filters.departmentId;
  }

  if (filters.type) {
    params.type = filters.type;
  }

  const response = await axiosInstance.get(
    "/api/admin-activity",
    { params },
  );

  return response.data.data;
};
