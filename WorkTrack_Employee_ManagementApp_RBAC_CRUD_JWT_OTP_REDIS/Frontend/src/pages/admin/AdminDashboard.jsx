
import { useNavigate } from "react-router-dom";

import {
  
  ArrowForward,
  Assessment,
  Business,
  Groups,
  People,
  Person,
  PersonAdd,
  Task,
} from "@mui/icons-material";

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

import useAuth from "../../hooks/useAuth";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Users",
      description: "View and manage users across the system.",
      icon: <People />,
      path: "/admin/users",
      color: "#1976D2",
      background: "#EAF3FF",
      buttonLabel: "View Users",
      variant: "contained",
    },
    {
      title: "Create Manager",
      description: "Create a new manager account for the organization.",
      icon: <PersonAdd />,
      path: "/admin/create-manager",
      color: "#7B1FA2",
      background: "#F4EAFE",
      buttonLabel: "Create Manager",
    },
    {
      title: "Departments",
      description: "Create and manage organization departments.",
      icon: <Business />,
      path: "/admin/departments",
      color: "#2E7D32",
      background: "#EAF6ED",
      buttonLabel: "Manage Departments",
    },
    {
      title: "Teams",
      description: "Manage teams, managers, and team members.",
      icon: <Groups />,
      path: "/admin/teams",
      color: "#00838F",
      background: "#E0F7FA",
      buttonLabel: "Manage Teams",
    },
    {
      title: "Tasks",
      description: "View and manage tasks across the organization.",
      icon: <Task />,
      path: "/admin/tasks",
      color: "#ED6C02",
      background: "#FFF3E5",
      buttonLabel: "Manage Tasks",
    },
    {
      title: "Analytics",
      description: "Review system performance and analytics.",
      icon: <Assessment />,
      path: "/admin/analytics",
      color: "#D32F2F",
      background: "#FDECEC",
      buttonLabel: "View Analytics",
    },
  ];

  const initials = (user?.name || "Admin")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return (
    <Box sx={{ width: "100%", maxWidth: 1500, mx: "auto" }}>
      {/* Page heading */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            fontSize: { xs: "1.65rem", sm: "2rem" },
          }}
        >
          Admin Dashboard
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Manage users, departments, teams, and system operations.
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
          background:
            "linear-gradient(120deg, #FFFFFF 0%, #F2F7FF 100%)",
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

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="overline"
                color="primary.main"
                fontWeight={700}
                letterSpacing={1.2}
              >
                ADMINISTRATOR WORKSPACE
              </Typography>

              <Typography variant="h5" fontWeight={700}>
                Welcome, {user?.name || "Admin"}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 0.75, overflowWrap: "anywhere" }}
              >
                {user?.email || "Manage the complete WorkTrack system."}
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
                  label={user?.role || "Admin"}
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
                  onClick={() => navigate("/admin/users")}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    ml: 0.5,
                  }}
                >
                  Manage Users
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Admin information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          My Information
        </Typography>

        <Card
          variant="outlined"
          sx={{ borderRadius: 3, borderColor: "divider" }}
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
              <InfoItem label="Full Name" value={user?.name} />
              <InfoItem label="Email Address" value={user?.email} />
              <InfoItem
                label="Department"
                value={user?.department}
              />
              <InfoItem
                label="Designation"
                value={user?.designation}
              />
            </Box>

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="body2" color="text.secondary">
              Manage organization-wide resources from Quick Access.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Quick access */}
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.75 }}>
          Quick Access
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Navigate to your frequently used administration sections.
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
                transition:
                  "border-color 160ms ease, box-shadow 160ms ease",
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

                <Typography variant="h6" fontWeight={700}>
                  {action.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    mb: 2.5,
                    flexGrow: 1,
                    lineHeight: 1.7,
                  }}
                >
                  {action.description}
                </Typography>

                <Button
                  variant={action.variant || "outlined"}
                  fullWidth
                  endIcon={<ArrowForward />}
                  onClick={() => navigate(action.path)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
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
};

function InfoItem({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={600}
        sx={{ mb: 0.5 }}
      >
        {label}
      </Typography>

      <Typography
        variant="body1"
        fontWeight={600}
        sx={{ overflowWrap: "anywhere" }}
      >
        {value || "Not available"}
      </Typography>
    </Box>
  );
}

export default AdminDashboard;
