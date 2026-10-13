
import { useMemo, useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBackRounded,
  BusinessRounded,
  GroupsRounded,
  PersonPinCircleRounded,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import {
  assignDepartmentApi,
  viewEmployeesApi,
} from "../../api/managerApi";

import { getDepartmentsApi } from "../../api/departmentApi";

const AssignDepartment = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [employeeId, setEmployeeId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch only the employees available to this manager.
  const {
    data: employees = [],
    isLoading: employeesLoading,
    error: employeesError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: viewEmployeesApi,
  });

  // Load department records so the assignment uses a department ID.
  const {
    data: departments = [],
    isLoading: departmentsLoading,
    error: departmentsError,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartmentsApi,
  });

  // Match the manager's department without exposing other departments
  // as selectable options.
  const managerDepartment = useMemo(() => {
    const managerDepartmentId =
      user?.departmentId?._id ||
      user?.departmentId;

    if (managerDepartmentId) {
      return departments.find(
        (department) =>
          String(department._id) ===
          String(managerDepartmentId),
      );
    }

    return departments.find(
      (department) =>
        department.name === user?.department,
    );
  }, [departments, user]);

  const assignMutation = useMutation({
    mutationFn: () =>
      assignDepartmentApi(
        employeeId,
        managerDepartment._id,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });

      queryClient.invalidateQueries({
        queryKey: ["managerEmployees"],
      });

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      setSuccessMessage(
        "Employee department assigned successfully.",
      );

      setErrorMessage("");
      setEmployeeId("");
    },

    onError: (error) => {
      setSuccessMessage("");

      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to assign department.",
      );
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!managerDepartment?._id) {
      setErrorMessage(
        "Your department could not be identified. Please check your manager profile.",
      );
      return;
    }

    if (!employeeId) {
      setErrorMessage("Please select an employee.");
      return;
    }

    assignMutation.mutate();
  };

  const isLoading =
    employeesLoading || departmentsLoading;

  const loadError =
    employeesError || departmentsError;

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={28} />
        <Typography color="text.secondary">
          Loading department information...
        </Typography>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {loadError.response?.data?.message ||
            loadError.message ||
            "Unable to load department information."}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100%",
        width: "100%",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 5 },
        backgroundColor: "#f5f7fb",
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 3.5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#172b4d",
              fontSize: {
                xs: "1.8rem",
                sm: "2.1rem",
              },
            }}
          >
            Assign Department
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#64748b",
              lineHeight: 1.7,
            }}
          >
            Assign an employee to your department.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 720,
            mx: "auto",
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 8px 28px rgba(15, 23, 42, 0.06)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: { xs: 2.5, sm: 4 },
              py: 3,
              backgroundColor: "#fff",
              borderBottom: "1px solid #e8edf4",
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2.5,
                color: "#1976d2",
                backgroundColor: "#eaf3ff",
              }}
            >
              <BusinessRounded sx={{ fontSize: 27 }} />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "#172b4d",
                  fontWeight: 750,
                }}
              >
                Department Assignment
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: "#64748b", mt: 0.5 }}
              >
                Select an employee to assign to your department.
              </Typography>
            </Box>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 2.5, sm: 4 },
              backgroundColor: "#fff",
            }}
          >
            <Stack spacing={2.5}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#f1f6fd",
                  border: "1px solid #dbeafe",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="flex-start"
                >
                  <BusinessRounded
                    sx={{ color: "#1976d2", mt: 0.3 }}
                  />

                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748b", mb: 0.5 }}
                    >
                      Your Department
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 750,
                        color: "#172b4d",
                      }}
                    >
                      {managerDepartment?.name ||
                        user?.department ||
                        "Department not identified"}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: "#64748b",
                        mt: 0.5,
                      }}
                    >
                      Only employees returned by your manager
                      employee API are available here.
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              {employees.length === 0 ? (
                <Alert severity="info">
                  No employees are available to assign.
                  Create an employee first.
                </Alert>
              ) : (
                <FormControl fullWidth required>
                  <InputLabel id="assign-department-employee-label">
                    Select Employee
                  </InputLabel>

                  <Select
                    labelId="assign-department-employee-label"
                    id="assign-department-employee"
                    value={employeeId}
                    label="Select Employee"
                    onChange={(event) => {
                      setEmployeeId(event.target.value);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    disabled={assignMutation.isPending}
                    startAdornment={
                      <PersonPinCircleRounded
                        sx={{
                          mr: 1,
                          color: "#64748b",
                        }}
                      />
                    }
                  >
                    {employees.map((employee) => (
                      <MenuItem
                        key={employee._id}
                        value={employee._id}
                      >
                        {employee.name} — {employee.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {errorMessage && (
                <Alert severity="error">
                  {errorMessage}
                </Alert>
              )}

              {successMessage && (
                <Alert severity="success">
                  {successMessage}
                </Alert>
              )}

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                spacing={1.5}
                justifyContent="flex-end"
                pt={1}
              >
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<ArrowBackRounded />}
                  onClick={() => navigate("/manager/employees")}
                  disabled={assignMutation.isPending}
                  sx={{
                    minWidth: { xs: "100%", sm: 130 },
                    py: 1.4,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    assignMutation.isPending ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    ) : (
                      <GroupsRounded />
                    )
                  }
                  disabled={
                    assignMutation.isPending ||
                    !employeeId ||
                    !managerDepartment?._id
                  }
                  sx={{
                    minWidth: { xs: "100%", sm: 210 },
                    py: 1.4,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    boxShadow: "none",
                    backgroundColor: "#1976d2",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                      boxShadow: "none",
                    },
                  }}
                >
                  {assignMutation.isPending
                    ? "Assigning..."
                    : "Assign Department"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AssignDepartment;