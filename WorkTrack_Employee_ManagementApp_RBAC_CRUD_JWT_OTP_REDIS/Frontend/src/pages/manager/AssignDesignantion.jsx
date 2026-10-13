
import { useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBackRounded,
  BadgeRounded,
  PersonPinCircleRounded,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import {
  assignDesignationApi,
  viewEmployeesApi,
} from "../../api/managerApi";

const AssignDesignation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch only the employees available to this manager.
  const {
    data: employees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: viewEmployeesApi,
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      assignDesignationApi(
        employeeId,
        designation.trim(),
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

      setEmployeeId("");
      setDesignation("");
      setErrorMessage("");
      setSuccessMessage(
        "Employee designation updated successfully.",
      );
    },

    onError: (error) => {
      setSuccessMessage("");

      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to assign designation.",
      );
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!employeeId) {
      setErrorMessage("Please select an employee.");
      return;
    }

    if (designation.trim().length < 2) {
      setErrorMessage(
        "Designation must contain at least 2 characters.",
      );
      return;
    }

    assignMutation.mutate();
  };

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
          Loading employees...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error.response?.data?.message ||
            error.message ||
            "Unable to load employees."}
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
            Assign Designation
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#64748b",
              lineHeight: 1.7,
            }}
          >
            Update an employee's job designation.
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
              <BadgeRounded sx={{ fontSize: 27 }} />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "#172b4d",
                  fontWeight: 750,
                }}
              >
                Designation Information
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: "#64748b", mt: 0.5 }}
              >
                Select an employee and enter their designation.
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
              {employees.length === 0 ? (
                <Alert severity="info">
                  No employees are available. Create an employee
                  first.
                </Alert>
              ) : (
                <FormControl fullWidth required>
                  <InputLabel id="designation-employee-label">
                    Select Employee
                  </InputLabel>

                  <Select
                    labelId="designation-employee-label"
                    id="designation-employee"
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

              <TextField
                fullWidth
                required
                label="Designation"
                name="designation"
                placeholder="Enter new designation"
                value={designation}
                onChange={(event) => {
                  setDesignation(event.target.value);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                disabled={assignMutation.isPending}
                inputProps={{
                  minLength: 2,
                  maxLength: 100,
                }}
              />

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
                      <BadgeRounded />
                    )
                  }
                  disabled={
                    assignMutation.isPending ||
                    !employeeId ||
                    designation.trim().length < 2
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
                    ? "Saving..."
                    : "Assign Designation"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AssignDesignation;