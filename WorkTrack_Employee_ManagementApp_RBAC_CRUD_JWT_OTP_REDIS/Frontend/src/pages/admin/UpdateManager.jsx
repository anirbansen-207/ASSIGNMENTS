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
  getSingleManagerApi,
  updateManagerApi,
} from "../../api/adminApi";

import { getDepartmentsApi } from "../../api/departmentApi";

const UpdateManager = () => {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const [managerData, setManagerData] =
    useState({
      name: "",
      email: "",
      departmentId: "",
      designation: "",
    });

  const {
    data: manager,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["manager", id],
    queryFn: () =>
      getSingleManagerApi(id),
  });

  const {
    data: departments = [],
    isLoading:
      departmentsLoading,
    error:
      departmentsError,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartmentsApi,
  });

  useEffect(() => {
    if (manager) {
      // Initialize the form from the fetched manager.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setManagerData({
        name: manager.name || "",
        email: manager.email || "",
        departmentId:
          manager.departmentId?._id ||
          manager.departmentId ||
          "",
        designation:
          manager.designation || "",
      });
    }
  }, [manager]);

  const {
    mutate,
    isPending,
    error: updateError,
  } = useMutation({
    mutationFn: ({
      managerId,
      data,
    }) =>
      updateManagerApi(
        managerId,
        data,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      queryClient.invalidateQueries({
        queryKey: ["manager", id],
      });

      navigate("/admin/users");
    },
  });

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setManagerData(
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
      managerId: id,
      data: managerData,
    });
  };

  if (
    isLoading ||
    departmentsLoading
  ) {
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

  if (departmentsError) {
    return (
      <h2>
        {departmentsError.response
          ?.data?.message ||
          departmentsError.message}
      </h2>
    );
  }

  return (
    <>
      <h2>
        Update Manager
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={managerData.name}
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
          value={managerData.email}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        <label>
          Department:
        </label>

        <select
          name="departmentId"
          value={
            managerData.departmentId
          }
          onChange={handleChange}
          required
        >
          <option value="">
            Select Department
          </option>

          {departments.map(
            (department) => (
              <option
                key={department._id}
                value={department._id}
              >
                {department.name}
              </option>
            ),
          )}
        </select>

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
            managerData.designation
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
            : "Update Manager"}
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

export default UpdateManager;