import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  Badge,
  Business,
  Edit,
  Email,
  Person,
  Work,
} from "@mui/icons-material";

import { viewOwnProfileApi } from "../../api/employeeApi";

function OwnProfile() {
  const navigate = useNavigate();

  // Fetch the logged-in employee's profile using the existing API.
  const {
    data: employee,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["employee"],
    queryFn: viewOwnProfileApi,
  });

  // Show a consistent loading state.
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">Loading your profile...</Typography>
      </Box>
    );
  }

  // Show an error with an option to retry.
  if (isError) {
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: 2 }}
        action={
          <Button
            color="inherit"
            size="small"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            Retry
          </Button>
        }
      >
        {error?.response?.data?.message ||
          error?.message ||
          "Unable to load your profile."}
      </Alert>
    );
  }

  if (!employee) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        No profile information is available.
      </Alert>
    );
  }

  // Generate initials for the employee avatar.
  const initials = (employee.name || "Employee")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1500,
        mx: "auto",
      }}
    >
      {/* Page heading: same size and spacing as Employee Dashboard. */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
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
            My Profile
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            View your personal and employment information.
          </Typography>
        </Box>
      </Stack>

      {/* Compact profile card matching the dashboard welcome card. */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          background: "linear-gradient(120deg, #FFFFFF 0%, #F2F7FF 100%)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={3}
          >
            <Avatar
              sx={{
                width: 68,
                height: 68,
                flexShrink: 0,
                bgcolor: "primary.main",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="overline"
                color="primary.main"
                fontWeight={700}
                letterSpacing={1.2}
              >
                EMPLOYEE PROFILE
              </Typography>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  fontSize: "1.4rem",
                  overflowWrap: "anywhere",
                }}
              >
                {employee.name || "Employee"}
              </Typography>

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mt: 0.75 }}
              >
                <Email fontSize="small" color="action" />

                <Typography
                  color="text.secondary"
                  sx={{ overflowWrap: "anywhere" }}
                >
                  {employee.email || "Email not available"}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                alignItems="center"
                sx={{ mt: 1.5 }}
              >
                <Chip
                  label={employee.role || "Employee"}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                />

                {employee.department && (
                  <Chip
                    label={employee.department}
                    size="small"
                    sx={{
                      bgcolor: "#FFFFFF",
                      border: "1px solid #DCE5F0",
                    }}
                  />
                )}

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => navigate("/employee/update-profile")}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    ml: 0.5,
                  }}
                >
                  Update Profile
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Personal information card. */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Personal Information
        </Typography>

        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "divider",
            backgroundColor: "#FFFFFF",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 3,
              }}
            >
              <ProfileField
                label="Full Name"
                value={employee.name}
                icon={<Person />}
              />

              <ProfileField
                label="Email Address"
                value={employee.email}
                icon={<Email />}
              />

              <ProfileField
                label="Account Role"
                value={employee.role}
                icon={<Badge />}
                capitalize
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Employment information card. */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Employment Information
        </Typography>

        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "divider",
            backgroundColor: "#FFFFFF",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 3,
              }}
            >
              <ProfileField
                label="Department"
                value={employee.department}
                icon={<Business />}
              />

              <ProfileField
                label="Designation"
                value={employee.designation}
                icon={<Work />}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

// Reusable information row, shared styling across profile fields.
function ProfileField({ label, value, icon, capitalize = false }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          borderRadius: 2,
          color: "primary.main",
          bgcolor: "#EAF3FF",
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>

        <Typography
          fontWeight={600}
          sx={{
            mt: 0.5,
            overflowWrap: "anywhere",
            textTransform: capitalize ? "capitalize" : "none",
          }}
        >
          {value || "Not assigned"}
        </Typography>
      </Box>
    </Stack>
  );
}

export default OwnProfile;
