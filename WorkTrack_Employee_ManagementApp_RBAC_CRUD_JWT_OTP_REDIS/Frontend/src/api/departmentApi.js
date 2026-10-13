import axiosInstance from "./axios";

export const getDepartmentsApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/department/view-department",
      );

    return response.data.departments;
  };

export const getSingleDepartmentApi =
  async (departmentId) => {
    const response =
      await axiosInstance.get(
        `/api/department/view-department/${departmentId}`,
      );

    return response.data.department;
  };

export const createDepartmentApi =
  async (departmentData) => {
    const response =
      await axiosInstance.post(
        "/api/department/create-department",
        departmentData,
      );

    return response.data.department;
  };

export const updateDepartmentApi =
  async (departmentId, departmentData) => {
    const response =
      await axiosInstance.put(
        `/api/department/update-department/${departmentId}`,
        departmentData,
      );

    return response.data.updatedDepartment;
  };

export const deleteDepartmentApi =
  async (departmentId) => {
    const response =
      await axiosInstance.delete(
        `/api/department/delete-department/${departmentId}`,
      );

    return response.data.deletedDepartment;
  };