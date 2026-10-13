
import { useEffect, useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  Person,
  Email,
  Save,
} from "@mui/icons-material";

import {
  viewOwnProfileApi,
  updateOwnProfileApi,
} from "../../api/employeeApi";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [employeeData, setEmployeeData] = useState({
    name: "",
    email: "",
  });

  // Fetch the current employee profile.
  const {
    data: employee,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employee"],
    queryFn: viewOwnProfileApi,
  });

  // Populate the form when the profile is available.
  useEffect(() => {
    if (employee) {
      // Initialize the form from the fetched profile.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmployeeData({
        name: employee.name || "",
        email: employee.email || "",
      });
    }
  }, [employee]);

  // Update the profile using the existing API.
  const {
    mutate,
    isPending,
    error: updateError,
  } = useMutation({
    mutationFn: updateOwnProfileApi,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["employee"],
      });

      navigate("/employee/ownProfile");
    },
  });

  // Handle changes to the input fields.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setEmployeeData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Submit the updated profile.
  const handleSubmit = (event) => {
    event.preventDefault();

    mutate({
      name: employeeData.name.trim(),
      email: employeeData.email.trim(),
    });
  };

  // Loading state.
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Profile loading error.
  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error.response?.data?.message ||
          error.message ||
          "Unable to load your profile."}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1500,
        mx: "auto",
      }}
    >
      {/* Page heading matching the dashboard design. */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            fontSize: {
              xs: "1.65rem",
              sm: "2rem",
            },
          }}
        >
          Update My Profile
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Update your personal account information.
        </Typography>
      </Box>

      {/* Profile form card. */}
      <Card
        elevation={0}
        sx={{
          maxWidth: 900,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Card header. */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: { xs: 2.5, sm: 3 },
            py: 2.5,
            background:
              "linear-gradient(120deg, #FFFFFF 0%, #F2F7FF 100%)",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              bgcolor: "#EAF3FF",
              color: "primary.main",
            }}
          >
            <Person fontSize="large" />
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700}>
              Personal Information
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Edit your name and email address.
            </Typography>
          </Box>
        </Box>

        <CardContent
          sx={{
            p: { xs: 2.5, sm: 3 },
            "&:last-child": {
              pb: { xs: 2.5, sm: 3 },
            },
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
          >
            <Stack spacing={3}>
              {/* Full name field. */}
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={employeeData.name}
                onChange={handleChange}
                required
                inputProps={{
                  minLength: 2,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Email address field. */}
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={employeeData.email}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Show the API error if the update fails. */}
              {updateError && (
                <Alert
                  severity="error"
                  sx={{ borderRadius: 2 }}
                >
                  {updateError.response?.data?.message ||
                    updateError.message ||
                    "Unable to update your profile."}
                </Alert>
              )}

              {/* Submit button. */}
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
                  disabled={
                    isPending ||
                    !employeeData.name.trim() ||
                    !employeeData.email.trim()
                  }
                  startIcon={
                    isPending ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    ) : (
                      <Save />
                    )
                  }
                  sx={{
                    minWidth: 190,
                    py: 1.25,
                    px: 3,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow:
                        "0 4px 12px rgba(25, 118, 210, 0.2)",
                    },
                  }}
                >
                  {isPending
                    ? "Updating..."
                    : "Update Profile"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UpdateProfile;
