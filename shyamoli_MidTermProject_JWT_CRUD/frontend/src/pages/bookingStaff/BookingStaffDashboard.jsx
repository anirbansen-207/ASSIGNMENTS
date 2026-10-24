
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";

import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PrintIcon from "@mui/icons-material/Print";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useNavigate } from "react-router-dom";

const BookingStaffDashboard = () => {
  const navigate = useNavigate();

  const staffOptions = [
    {
      title: "Create Offline Booking",
      description:
        "Create a booking for a customer, choose an available trip and select seats.",
      icon: <PointOfSaleIcon sx={{ fontSize: 32 }} />,
      path: "/booking-staff/create-booking",
      buttonText: "Create Booking",
      color: "#16a34a",
      background: "#e9f9ef",
      primary: true,
    },
    {
      title: "Bookings",
      description:
        "View and manage bookings handled by the booking staff.",
      icon: <ConfirmationNumberIcon sx={{ fontSize: 32 }} />,
      path: "/booking-staff/bookings",
      buttonText: "Manage Bookings",
      color: "#2563eb",
      background: "#eaf2ff",
      primary: false,
    },
    {
      title: "Print Ticket",
      description:
        "Open ticket operations to generate or print customer tickets after booking.",
      icon: <PrintIcon sx={{ fontSize: 32 }} />,
      path: "/booking-staff/print-ticket",
      buttonText: "Print Tickets",
      color: "#7c3aed",
      background: "#f2ebff",
      primary: false,
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
        pb: 4,
      }}
    >
      {/* Welcome banner */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          overflow: "hidden",
          borderRadius: 4,
          color: "#fff",
          background:
            "linear-gradient(120deg, #071832 0%, #102c4d 70%, #12543c 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            "&:last-child": { pb: { xs: 3, sm: 4, md: 5 } },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              gap: 3,
            }}
          >
            <Box sx={{ maxWidth: 760 }}>
              <Typography
                sx={{
                  color: "#4ade80",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  mb: 1,
                }}
              >
                GREENBUS · STAFF PORTAL
              </Typography>

              <Typography
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 27, sm: 34, md: 40 },
                  lineHeight: 1.2,
                  mb: 1.5,
                }}
              >
                Booking Staff Dashboard
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.82)",
                  lineHeight: 1.8,
                  fontSize: { xs: 14, sm: 16 },
                }}
              >
                Manage offline reservations, review bookings and
                handle customer ticket operations from one place.
              </Typography>
            </Box>

            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                width: { sm: 110, md: 145 },
                height: { sm: 110, md: 145 },
                flexShrink: 0,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                backgroundColor: "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.25)",
              }}
            >
              <DirectionsBusIcon
                sx={{
                  fontSize: { sm: 62, md: 82 },
                  color: "#4ade80",
                }}
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/booking-staff/create-booking")}
            sx={{
              mt: 3,
              px: 2.5,
              py: 1.2,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              color: "#052e16",
              backgroundColor: "#4ade80",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#22c55e",
                boxShadow: "none",
              },
            }}
          >
            Create Offline Booking
          </Button>
        </CardContent>
      </Card>

      {/* Quick actions heading */}
      <Box sx={{ mb: 2.5 }}>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: 21, sm: 25 },
            fontWeight: 800,
            color: "#10233f",
          }}
        >
          Quick Actions
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 0.5, fontSize: 14 }}
        >
          Select an operation to continue your work.
        </Typography>
      </Box>

      {/* Staff action cards */}
      <Grid container spacing={3} alignItems="stretch">
        {staffOptions.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.title}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                minHeight: 250,
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                backgroundColor: "#fff",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 28px rgba(15, 35, 65, 0.09)",
                  borderColor: item.color,
                },
              }}
            >
              <CardContent
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  flexGrow: 1,
                  "&:last-child": { pb: 3 },
                }}
              >
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2.5,
                    color: item.color,
                    backgroundColor: item.background,
                    mb: 2.5,
                  }}
                >
                  {item.icon}
                </Box>

                <Typography
                  component="h3"
                  sx={{
                    fontSize: 19,
                    fontWeight: 750,
                    color: "#12233b",
                    mb: 1,
                  }}
                >
                  {item.title}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.8,
                    flexGrow: 1,
                    mb: 2.5,
                  }}
                >
                  {item.description}
                </Typography>

                <Button
                  variant={item.primary ? "contained" : "outlined"}
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(item.path)}
                  fullWidth
                  sx={{
                    justifyContent: "space-between",
                    px: 2,
                    py: 1.1,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    color: item.primary ? "#fff" : item.color,
                    borderColor: item.color,
                    backgroundColor: item.primary ? item.color : "transparent",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: item.color,
                      backgroundColor: item.primary
                        ? item.color
                        : item.background,
                      boxShadow: "none",
                    },
                  }}
                >
                  {item.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Staff reminder */}
      <Box
        sx={{
          mt: 4,
          p: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderRadius: 3,
          border: "1px solid #d9f2e2",
          backgroundColor: "#f0fbf4",
        }}
      >
        <Box sx={{ color: "#15803d", display: "flex" }}>
          <ConfirmationNumberIcon />
        </Box>

        <Box>
          <Typography
            sx={{ fontWeight: 700, color: "#14532d", fontSize: 14 }}
          >
            Booking and ticket operations
          </Typography>

          <Typography
            sx={{ color: "#39704e", fontSize: 13, mt: 0.3 }}
          >
            Verify booking details before generating or printing a ticket.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default BookingStaffDashboard;
