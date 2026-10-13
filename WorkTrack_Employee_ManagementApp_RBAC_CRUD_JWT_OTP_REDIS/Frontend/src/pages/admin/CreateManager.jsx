
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  BusinessRounded,
  PersonAddRounded,
} from "@mui/icons-material";

import { createManagerApi } from "../../api/adminApi";
import { getDepartmentsApi } from "../../api/departmentApi";

const CreateManager = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [managerData, setManagerData] = useState({
    name: "",
    email: "",
    password: "",
    departmentId: "",
    designation: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch departments for the manager's department selection.
  const {
    data: departments = [],
    isLoading: departmentsLoading,
    error: departmentsError,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartmentsApi,
  });

  // Create the manager using the existing backend API.
  const createManagerMutation = useMutation({
    mutationFn: createManagerApi,

    onSuccess: () => {
      // Refresh user and manager data after successful creation.
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      queryClient.invalidateQueries({
        queryKey: ["managers"],
      });

      setManagerData({
        name: "",
        email: "",
        password: "",
        departmentId: "",
        designation: "",
      });

      setErrorMessage("");
      setSuccessMessage("Manager created successfully.");
    },

    onError: (error) => {
      setSuccessMessage("");
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to create manager.",
      );
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setManagerData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    // Send the fields expected by the existing API.
    createManagerMutation.mutate({
      ...managerData,
      name: managerData.name.trim(),
      email: managerData.email.trim(),
      designation: managerData.designation.trim(),
    });
  };

  const isSubmitting = createManagerMutation.isPending;

  if (departmentsLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <CircularProgress size={28} />
        <Typography sx={{ mt: 2, color: "text.secondary" }}>
          Loading departments...
        </Typography>
      </Box>
    );
  }

  if (departmentsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {departmentsError.response?.data?.message ||
            departmentsError.message ||
            "Unable to load departments."}
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
        {/* Page heading */}
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
            Create Manager
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#64748b",
              lineHeight: 1.7,
            }}
          >
            Add a new manager and assign a department.
          </Typography>
        </Box>

        {/* Manager creation card */}
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
                Manager Information
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  mt: 0.5,
                }}
              >
                Enter the manager's details below.
              </Typography>
            </Box>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            autoComplete="off"
            sx={{
              p: { xs: 2.5, sm: 4 },
              backgroundColor: "#ffffff",
            }}
          >
            <Stack spacing={2.5}>
              {/* Manager's name */}
              <TextField
                fullWidth
                required
                name="name"
                label="Full Name"
                placeholder="Enter manager name"
                value={managerData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                slotProps={{
                  htmlInput: {
                    minLength: 2,
                    autoComplete: "off",
                  },
                }}
              />

              {/* Manager's email */}
              <TextField
                fullWidth
                required
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter manager email"
                value={managerData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                slotProps={{
                  htmlInput: {
                    autoComplete: "off",
                  },
                }}
              />

              {/* Initial password */}
              <TextField
                fullWidth
                required
                name="password"
                type="password"
                label="Password"
                placeholder="Create an initial password"
                value={managerData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                slotProps={{
                  htmlInput: {
                    minLength: 6,
                    autoComplete: "new-password",
                  },
                }}
              />

              {/* Department selection */}
              <FormControl fullWidth required>
                <InputLabel id="manager-department-label">
                  Department
                </InputLabel>

                <Select
                  labelId="manager-department-label"
                  id="manager-department"
                  name="departmentId"
                  value={managerData.departmentId}
                  label="Department"
                  onChange={handleChange}
                  disabled={isSubmitting}
                  startAdornment={
                    <BusinessRounded
                      sx={{
                        mr: 1,
                        color: "#64748b",
                      }}
                    />
                  }
                >
                  {departments.length === 0 ? (
                    <MenuItem value="" disabled>
                      No departments available
                    </MenuItem>
                  ) : (
                    departments.map((department) => (
                      <MenuItem
                        key={department._id}
                        value={department._id}
                      >
                        {department.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              {/* Manager's designation */}
              <TextField
                fullWidth
                required
                name="designation"
                label="Designation"
                placeholder="Enter manager designation"
                value={managerData.designation}
                onChange={handleChange}
                disabled={isSubmitting}
                slotProps={{
                  htmlInput: {
                    minLength: 2,
                  },
                }}
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

              {/* Show backend validation or creation errors. */}
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

              {/* Form actions */}
              <Stack
                direction={{
                  xs: "column-reverse",
                  sm: "row",
                }}
                spacing={1.5}
                justifyContent="flex-end"
                pt={1}
              >
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<ArrowBackRounded />}
                  onClick={() => navigate("/admin/users")}
                  disabled={isSubmitting}
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
                  disabled={
                    isSubmitting ||
                    departments.length === 0
                  }
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
                    ? "Creating Manager..."
                    : "Create Manager"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateManager;