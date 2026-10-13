import {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  viewSingleEmployeeApi,
  updateEmployeeApi,
} from "../../api/managerApi";

const UpdateEmployee = () => {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const [employeeData, setEmployeeData] =
    useState({
      name: "",
      email: "",
      designation: "",
    });

  const {
    data: employee,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "employee",
      id,
    ],
    queryFn: () =>
      viewSingleEmployeeApi(id),
  });

  useEffect(() => {
    if (employee) {
      // Initialize the form from the fetched employee.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmployeeData({
        name: employee.name || "",
        email: employee.email || "",
        designation:
          employee.designation || "",
      });
    }
  }, [employee]);

  const {
    mutate,
    isPending,
    error: updateError,
  } = useMutation({
    mutationFn: ({
      employeeId,
      data,
    }) =>
      updateEmployeeApi(
        employeeId,
        data,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "employee",
          id,
        ],
      });

      navigate(
        "/manager/employees",
      );
    },
  });

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setEmployeeData(
      (previousData) => ({
        ...previousData,
        [name]: value,
      }),
    );
  };

  const handleSubmit = (
    event,
  ) => {
    event.preventDefault();

    mutate({
      employeeId: id,
      data: employeeData,
    });
  };

  if (isLoading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return (
      <h2>
        {error.response?.data
          ?.message ||
          error.message}
      </h2>
    );
  }

  return (
    <>
      <h2>
        Update Employee
      </h2>

      <p>
        Department:{" "}
        {employee.department}
      </p>

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

        <label>
          Designation:
        </label>

        <input
          type="text"
          name="designation"
          placeholder="Enter Designation"
          value={
            employeeData.designation
          }
          onChange={handleChange}
          minLength={2}
          required
        />

        <br />
        <br />

        <button
          type="submit"
          disabled={isPending}
        >
          {isPending
            ? "Updating..."
            : "Update Employee"}
        </button>
      </form>

      {updateError && (
        <p>
          {updateError.response?.data
            ?.message ||
            updateError.message}
        </p>
      )}
    </>
  );
};

export default UpdateEmployee;