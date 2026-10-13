import { useNavigate } from "react-router-dom";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowForward,
  Assignment,
  CalendarMonth,
  Edit,
  Groups,
  Person,
} from "@mui/icons-material";

import useAuth from "../../hooks/useAuth";

function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Existing employee routes are preserved.
  const quickActions = [
    {
      title: "My Profile",
      description: "View your personal and work information.",
      icon: <Person />,
      path: "/employee/ownProfile",
      color: "#1976D2",
      background: "#EAF3FF",
      buttonLabel: "View Profile",
    },
    {
      title: "Update Profile",
      description: "Update your profile information.",
      icon: <Edit />,
      path: "/employee/update-profile",
      color: "#7B1FA2",
      background: "#F4EAFE",
      buttonLabel: "Edit Profile",
    },
    {
      title: "My Team",
      description: "View your team information.",
      icon: <Groups />,
      path: "/employee/my-team",
      color: "#2E7D32",
      background: "#EAF6ED",
      buttonLabel: "View Team",
    },
    {
      title: "My Tasks",
      description: "Review your assigned tasks and progress.",
      icon: <Assignment />,
      path: "/employee/my-tasks",
      color: "#ED6C02",
      background: "#FFF3E5",
      buttonLabel: "View Tasks",
    },
    {
      title: "Attendance",
      description: "Check your attendance records.",
      icon: <CalendarMonth />,
      path: "/employee/attendance",
      color: "#00838F",
      background: "#E0F7FA",
      buttonLabel: "View Attendance",
    },
    {
      title: "Leave",
      description: "View and manage your leave requests.",
      icon: <CalendarMonth />,
      path: "/employee/leave",
      color: "#D32F2F",
      background: "#FDECEC",
      buttonLabel: "View Leave",
    },
  ];

  // Generate initials from the logged-in employee's name.
  const initials = (user?.name || "Employee")
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
      {/* Page heading */}
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
          Employee Dashboard
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Welcome back! Here is your personal workspace.
        </Typography>
      </Box>

      {/* Welcome card */}
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
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={3}
          >
            <Avatar
              sx={{
                width: 76,
                height: 76,
                bgcolor: "primary.main",
                fontSize: 28,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="overline"
                color="primary.main"
                fontWeight={700}
                letterSpacing={1.2}
              >
                EMPLOYEE WORKSPACE
              </Typography>

              <Typography variant="h5" fontWeight={700}>
                Welcome, {user?.name || "Employee"}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 0.75, overflowWrap: "anywhere" }}
              >
                {user?.email || "Email not available"}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                alignItems="center"
                sx={{ mt: 1.5 }}
              >
                <Chip
                  label={user?.role || "Employee"}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ textTransform: "capitalize" }}
                />

                {user?.department && (
                  <Chip
                    label={user.department}
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
                  startIcon={<Person />}
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/employee/ownProfile")}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    ml: 0.5,
                  }}
                >
                  My Profile
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Employee information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          My Information
        </Typography>

        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "divider",
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
              <InfoItem
                label="Full Name"
                value={user?.name}
                icon={<Person />}
              />

              <InfoItem
                label="Email Address"
                value={user?.email}
                icon={<Person />}
              />

              <InfoItem
                label="Department"
                value={user?.department}
                icon={<Groups />}
              />

              <InfoItem
                label="Designation"
                value={user?.designation}
                icon={<Assignment />}
              />
            </Box>

            <Divider sx={{ my: 2.5 }} />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Typography variant="body2" color="text.secondary">
                Keep your employee profile up to date.
              </Typography>

              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => navigate("/employee/update-profile")}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Update Information
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Quick access cards */}
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.75 }}>
          Quick Access
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Navigate to your frequently used sections.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {quickActions.map((action) => (
            <Card
              key={action.title}
              variant="outlined"
              sx={{
                height: "100%",
                borderRadius: 3,
                borderColor: "divider",
                transition: "border-color 160ms ease, box-shadow 160ms ease",
                "&:hover": {
                  borderColor: action.color,
                  boxShadow: "0 5px 18px rgba(15, 23, 42, 0.07)",
                },
              }}
            >
              <CardContent
                sx={{
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  boxSizing: "border-box",
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 2,
                    color: action.color,
                    bgcolor: action.background,
                    mb: 2,
                    "& svg": { fontSize: 25 },
                  }}
                >
                  {action.icon}
                </Box>

                <Typography variant="subtitle1" fontWeight={700}>
                  {action.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.75,
                    mb: 2.5,
                    flexGrow: 1,
                  }}
                >
                  {action.description}
                </Typography>

                <Button
                  variant="text"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate(action.path)}
                  sx={{
                    mt: "auto",
                    px: 0,
                    color: action.color,
                    textTransform: "none",
                    fontWeight: 600,
                    alignSelf: "flex-start",
                  }}
                >
                  {action.buttonLabel}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// Reusable employee information row.
function InfoItem({ label, value, icon }) {
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
          bgcolor: "#EAF3FF",
          color: "primary.main",
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
          }}
        >
          {value || "Not assigned"}
        </Typography>
      </Box>
    </Stack>
  );
}

export default EmployeeDashboard;
