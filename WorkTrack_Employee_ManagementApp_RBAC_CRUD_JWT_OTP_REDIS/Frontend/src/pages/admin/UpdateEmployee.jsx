import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useNavigate, useParams } from "react-router-dom";

import { getSingleEmployeeApi, updateEmployeeApi } from "../../api/adminApi";

import { getDepartmentsApi } from "../../api/departmentApi";

const UpdateEmployee = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [employeeData, setEmployeeData] = useState({
    name: "",
    email: "",
    departmentId: "",
    designation: "",
  });

  const {
    data: employee,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminEmployee", id],
    queryFn: () => getSingleEmployeeApi(id),
  });

  const {
    data: departments = [],
    isLoading: departmentsLoading,
    error: departmentsError,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartmentsApi,
  });

  useEffect(() => {
    if (employee) {
      // Initialize the form from the fetched employee.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmployeeData({
        name: employee.name || "",
        email: employee.email || "",
        departmentId: employee.departmentId?._id || employee.departmentId || "",
        designation: employee.designation || "",
      });
    }
  }, [employee]);

  const {
    mutate,
    isPending,
    error: updateError,
  } = useMutation({
    mutationFn: ({ employeeId, data }) => updateEmployeeApi(employeeId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      queryClient.invalidateQueries({
        queryKey: ["adminEmployee", id],
      });

      navigate("/admin/users");
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setEmployeeData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    mutate({
      employeeId: id,
      data: employeeData,
    });
  };

  if (isLoading || departmentsLoading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>{error.response?.data?.message || error.message}</h2>;
  }

  if (departmentsError) {
    return (
      <h2>
        {departmentsError.response?.data?.message || departmentsError.message}
      </h2>
    );
  }

  return (
    <>
      <h2>Update Employee</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={employeeData.name}
          onChange={handleChange}
          minLength={2}
          required
        />

        <br />
        <br />

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={employeeData.email}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        <label>Department:</label>

        <select
          name="departmentId"
          value={employeeData.departmentId}
          onChange={handleChange}
          required
        >
          <option value="">Select Department</option>

          {departments.map((department) => (
            <option key={department._id} value={department._id}>
              {department.name}
            </option>
          ))}
        </select>

        <br />
        <br />

        <label>Designation:</label>

        <input
          type="text"
          name="designation"
          placeholder="Enter Designation"
          value={employeeData.designation}
          onChange={handleChange}
          minLength={2}
          required
        />

        <br />
        <br />

        <button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update Employee"}
        </button>
      </form>

      {updateError && (
        <p>{updateError.response?.data?.message || updateError.message}</p>
      )}
    </>
  );
};

export default UpdateEmployee;
