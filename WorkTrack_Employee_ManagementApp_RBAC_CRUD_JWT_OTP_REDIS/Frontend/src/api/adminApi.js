import axiosInstance from "./axios";

export const getAllUsers =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/admin/users",
      );

    return response.data.users;
  };

export const createManagerApi =
  async (managerData) => {
    const response =
      await axiosInstance.post(
        "/api/admin/create_manager",
        managerData,
      );

    return response.data.manager;
  };

export const getSingleManagerApi =
  async (managerId) => {
    const response =
      await axiosInstance.get(
        `/api/admin/view_manager/${managerId}`,
      );

    return response.data.manager;
  };

export const updateManagerApi =
  async (
    managerId,
    data,
  ) => {
    const response =
      await axiosInstance.put(
        `/api/admin/update_manager/${managerId}`,
        data,
      );

    return response.data.updatedManager;
  };

export const deleteManagerApi =
  async (managerId) => {
    const response =
      await axiosInstance.delete(
        `/api/admin/delete_manager/${managerId}`,
      );

    return response.data.deletedManager;
  };

export const getSingleEmployeeApi =
  async (employeeId) => {
    const response =
      await axiosInstance.get(
        `/api/admin/employee/${employeeId}`,
      );

    return response.data.employee;
  };

export const updateEmployeeApi =
  async (
    employeeId,
    data,
  ) => {
    const response =
      await axiosInstance.put(
        `/api/admin/employee_update/${employeeId}`,
        data,
      );

    return response.data.updatedEmployee;
  };

export const deleteEmployeeApi =
  async (employeeId) => {
    const response =
      await axiosInstance.delete(
        `/api/admin/employee_delete/${employeeId}`,
      );

    return response.data.deletedEmployee;
  };