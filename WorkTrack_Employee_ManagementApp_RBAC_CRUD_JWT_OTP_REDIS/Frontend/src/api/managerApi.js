import axiosInstance from "./axios";

export const createEmployeeApi =
  async (employeeData) => {
    const response =
      await axiosInstance.post(
        "/api/manager/create_employee",
        employeeData,
      );

    return response.data.employee;
  };

export const viewEmployeesApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/manager/all_employees",
      );

    return response.data.allEmployees;
  };

export const updateEmployeeApi =
  async (
    employeeId,
    data,
  ) => {
    const response =
      await axiosInstance.put(
        `/api/manager/update_employee/${employeeId}`,
        data,
      );

    return response.data.employee;
  };

export const viewSingleEmployeeApi =
  async (employeeId) => {
    const response =
      await axiosInstance.get(
        `/api/manager/employee/${employeeId}`,
      );

    return response.data.singleEmployee;
  };

export const deleteEmployeeApi =
  async (employeeId) => {
    const response =
      await axiosInstance.delete(
        `/api/manager/employee_delete/${employeeId}`,
      );

    return response.data.deletedEmployee;
  };

export const assignDepartmentApi =
  async (
    employeeId,
    departmentId,
  ) => {
    const response =
      await axiosInstance.patch(
        `/api/manager/employee/${employeeId}/department`,
        {
          departmentId,
        },
      );

    return response.data.employee;
  };

export const assignDesignationApi =
  async (
    employeeId,
    designation,
  ) => {
    const response =
      await axiosInstance.patch(
        `/api/manager/employee/${employeeId}/designation`,
        {
          designation,
        },
      );

    return response.data.employee;
  };