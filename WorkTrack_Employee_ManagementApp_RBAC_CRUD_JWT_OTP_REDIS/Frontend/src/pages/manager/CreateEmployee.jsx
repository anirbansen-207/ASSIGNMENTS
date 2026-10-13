
import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  PersonAddRounded,
  BadgeRounded,
  BusinessRounded,
} from "@mui/icons-material";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createEmployeeApi } from "../../api/managerApi";
import useAuth from "../../hooks/useAuth";

const CreateEmployee = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    designation: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Create an employee using the existing backend API.
  const createEmployeeMutation = useMutation({
    mutationFn: createEmployeeApi,

    onSuccess: () => {
      // Refresh employee lists after successful creation.
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      queryClient.invalidateQueries({
        queryKey: ["managerEmployees"],
      });

      setFormData({
        name: "",
        email: "",
        password: "",
        designation: "",
      });

      setErrorMessage("");
      setSuccessMessage(
        "Employee created successfully.",
      );
    },

    onError: (error) => {
      setSuccessMessage("");
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to create employee.",
      );
    },
  });

  // Keep form state synchronized with the fields.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  // Submit the fields expected by the existing API.
  const handleSubmit = (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    createEmployeeMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      designation: formData.designation.trim(),
    });
  };

  const isSubmitting = createEmployeeMutation.isPending;

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
        {/* Page heading */}
        <Box sx={{ mb: 3.5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#172b4d",
              fontSize: { xs: "1.8rem", sm: "2.1rem" },
            }}
          >
            Create Employee
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#64748b",
              lineHeight: 1.7,
            }}
          >
            Add a new employee to your department.
          </Typography>
        </Box>

        {/* Employee creation form */}
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
          {/* Card heading */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: { xs: 2.5, sm: 4 },
              py: 3,
              backgroundColor: "#ffffff",
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
              <PersonAddRounded sx={{ fontSize: 27 }} />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "#172b4d",
                  fontWeight: 750,
                }}
              >
                Employee Information
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: "#64748b", mt: 0.5 }}
              >
                Enter the employee's details below.
              </Typography>
            </Box>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 2.5, sm: 4 },
              backgroundColor: "#ffffff",
            }}
          >
            <Stack spacing={2.5}>
              {/* Display the manager's existing department. */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#f1f6fd",
                  border: "1px solid #dbeafe",
                }}
              >
                <BusinessRounded
                  sx={{
                    color: "#1976d2",
                    mt: 0.3,
                  }}
                />

                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      mb: 0.5,
                    }}
                  >
                    Assigned Department
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#172b4d",
                    }}
                  >
                    {user?.department || "Your department"}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "#64748b",
                      mt: 0.5,
                    }}
                  >
                    The employee will be created under
                    your department according to the
                    backend's assignment rules.
                  </Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                required
                name="name"
                label="Full Name"
                placeholder="Enter employee name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="name"
              />

              <TextField
                fullWidth
                required
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter employee email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="email"
              />

              <TextField
                fullWidth
                required
                name="password"
                type="password"
                label="Password"
                placeholder="Create an initial password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="new-password"
              />

              <TextField
                fullWidth
                required
                name="designation"
                label="Designation"
                placeholder="Enter employee designation"
                value={formData.designation}
                onChange={handleChange}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <BadgeRounded
                      sx={{
                        mr: 1,
                        color: "#64748b",
                      }}
                    />
                  ),
                }}
              />

              {/* Display API success or error feedback. */}
              {successMessage && (
                <Alert severity="success">
                  {successMessage}
                </Alert>
              )}

              {errorMessage && (
                <Alert severity="error">
                  {errorMessage}
                </Alert>
              )}

              {/* Form actions */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  pt: 1,
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    ) : (
                      <PersonAddRounded />
                    )
                  }
                  sx={{
                    minWidth: { xs: "100%", sm: 200 },
                    py: 1.4,
                    px: 3,
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
                  {isSubmitting
                    ? "Creating Employee..."
                    : "Create Employee"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateEmployee;