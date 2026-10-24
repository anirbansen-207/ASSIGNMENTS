import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import RouteIcon from "@mui/icons-material/Route";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EventIcon from "@mui/icons-material/Event";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import { useNavigate } from "react-router-dom";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  // Existing routes from the GreenBus frontend ZIP are preserved.
  const managementItems = [
    {
      title: "Buses",
      description:
        "Manage the GreenBus fleet, bus numbers, categories and bus information.",
      icon: <DirectionsBusIcon />,
      path: "/super-admin/buses",
      color: "#16a765",
      background: "#e8f8ef",
    },
    {
      title: "Routes",
      description:
        "Create and maintain source cities, destinations and bus routes.",
      icon: <RouteIcon />,
      path: "/super-admin/routes",
      color: "#1976d2",
      background: "#eaf3ff",
    },
    {
      title: "Trips",
      description:
        "Schedule trips and manage departure and arrival information.",
      icon: <EventIcon />,
      path: "/super-admin/trips",
      color: "#8b5cf6",
      background: "#f1ebff",
    },
    {
      title: "Seat Layouts",
      description:
        "Configure bus seating arrangements and seat categories.",
      icon: <EventSeatIcon />,
      path: "/super-admin/seat-layouts",
      color: "#d97706",
      background: "#fff4df",
    },
    {
      title: "Drivers",
      description:
        "Manage driver information and support trip operations.",
      icon: <PersonIcon />,
      path: "/super-admin/drivers",
      color: "#0891b2",
      background: "#e3f8fc",
    },
    {
      title: "Booking Staff",
      description:
        "Manage staff accounts responsible for offline bookings and tickets.",
      icon: <GroupsIcon />,
      path: "/super-admin/booking-staff",
      color: "#db2777",
      background: "#fceaf3",
    },
    {
      title: "Customers",
      description:
        "View registered customers and access their information.",
      icon: <PeopleIcon />,
      path: "/super-admin/customers",
      color: "#4f46e5",
      background: "#ecebff",
    },
    {
      title: "Bookings",
      description:
        "Review customer reservations and access booking details.",
      icon: <ConfirmationNumberIcon />,
      path: "/super-admin/bookings",
      color: "#0f766e",
      background: "#e2f7f2",
    },
  ];

  const quickActions = [
    {
      label: "Add Bus",
      icon: <DirectionsBusIcon />,
      path: "/super-admin/buses/add",
    },
    {
      label: "Add Route",
      icon: <RouteIcon />,
      path: "/super-admin/routes/add",
    },
    {
      label: "Schedule Trip",
      icon: <EventIcon />,
      path: "/super-admin/trips/add",
    },
    {
      label: "Add Driver",
      icon: <PersonIcon />,
      path: "/super-admin/drivers/add",
    },
  ];

  return (
    <Box
      sx={{
        maxWidth: 1500,
        mx: "auto",
        pb: 4,
      }}
    >
      {/* Dashboard welcome banner */}
      <Card
        elevation={0}
        sx={{
          position: "relative",
          mb: 4,
          overflow: "hidden",
          borderRadius: { xs: 3, md: 4 },
          color: "#ffffff",
          background:
            "linear-gradient(115deg, #071631 0%, #0b2344 60%, #104d43 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Decorative background shapes */}
        <Box
          sx={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: "50%",
            right: -90,
            top: -130,
            background: "rgba(34,197,94,0.12)",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: 150,
            height: 150,
            borderRadius: "50%",
            right: 100,
            bottom: -110,
            background: "rgba(255,255,255,0.035)",
            pointerEvents: "none",
          }}
        />

        <CardContent
          sx={{
            position: "relative",
            zIndex: 1,
            p: { xs: 2.5, sm: 3.5, md: 5 },
            "&:last-child": { pb: { xs: 2.5, sm: 3.5, md: 5 } },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                flexShrink: 0,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#20c46a",
                color: "#062b20",
                boxShadow: "0 8px 24px rgba(32,196,106,0.2)",
              }}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: 38 }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "#86efac",
                  fontWeight: 700,
                  letterSpacing: 2,
                }}
              >
                GREENBUS ADMINISTRATION
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.2,
                  fontSize: {
                    xs: "1.8rem",
                    sm: "2.25rem",
                  },
                }}
              >
                Super Admin Dashboard
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "rgba(255,255,255,0.76)",
                  lineHeight: 1.7,
                  maxWidth: 700,
                }}
              >
                Manage your bus fleet, routes, trips, staff, customers
                and bookings from one central workspace.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ mt: 3.5 }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/super-admin/buses/add")}
              sx={{
                bgcolor: "#20c46a",
                color: "#062b20",
                fontWeight: 700,
                borderRadius: 2,
                px: 2.5,
                py: 1.2,
                textTransform: "none",
                "&:hover": { bgcolor: "#16a765" },
              }}
            >
              Add New Bus
            </Button>

            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/super-admin/bookings")}
              sx={{
                color: "#ffffff",
                borderColor: "rgba(255,255,255,0.35)",
                borderRadius: 2,
                px: 2.5,
                py: 1.2,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#86efac",
                  bgcolor: "rgba(255,255,255,0.06)",
                },
              }}
            >
              View Bookings
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "#10213a",
          }}
        >
          Quick Actions
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 0.5, mb: 2.5 }}
        >
          Jump directly to common administration tasks.
        </Typography>

        <Grid container spacing={2}>
          {quickActions.map((action) => (
            <Grid item xs={12} sm={6} md={3} key={action.label}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={action.icon}
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate(action.path)}
                sx={{
                  justifyContent: "space-between",
                  minHeight: 58,
                  px: 2,
                  borderRadius: 2.5,
                  borderColor: "#dce5ed",
                  bgcolor: "#ffffff",
                  color: "#10213a",
                  fontWeight: 700,
                  textTransform: "none",
                  "& .MuiButton-startIcon": {
                    color: "#16a765",
                  },
                  "&:hover": {
                    borderColor: "#16a765",
                    bgcolor: "#f3fcf6",
                  },
                }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Management modules */}
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "#10213a",
          }}
        >
          Management Overview
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Select a module to manage the corresponding part of GreenBus.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {managementItems.map((item) => (
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            key={item.title}
          >
            <Card
              onClick={() => navigate(item.path)}
              sx={{
                height: "100%",
                minHeight: 225,
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                borderRadius: 3,
                bgcolor: "#ffffff",
                border: "1px solid #e6ebf1",
                boxShadow: "0 3px 12px rgba(15,23,42,0.035)",
                transition:
                  "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  borderColor: item.color,
                  boxShadow: "0 12px 28px rgba(15,23,42,0.09)",
                },
              }}
            >
              <CardContent
                sx={{
                  p: 2.75,
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                  "&:last-child": { pb: 2.75 },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 2.25 }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: item.background,
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      bgcolor: "#f5f7fa",
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 19 }} />
                  </Box>
                </Stack>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "#10213a",
                    fontSize: "1.08rem",
                  }}
                >
                  {item.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    lineHeight: 1.75,
                    flexGrow: 1,
                  }}
                >
                  {item.description}
                </Typography>

                <Typography
                  sx={{
                    mt: 2.25,
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    color: item.color,
                  }}
                >
                  Manage {item.title} →
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Footer note */}
      <Box
        sx={{
          mt: 4,
          p: 2.5,
          borderRadius: 3,
          border: "1px solid #dcefe3",
          bgcolor: "#f2fbf5",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#d9f7e5",
              color: "#13864e",
              flexShrink: 0,
            }}
          >
            <DashboardIcon />
          </Box>

          <Box>
            <Typography fontWeight={800} color="#123b28">
              One workspace for GreenBus operations
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Use the management modules above to maintain fleet
              information, schedules, staff and passenger bookings.
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default SuperAdminDashboard;
