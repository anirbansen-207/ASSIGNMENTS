import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import {
  AppBar,
  Avatar,
  Box,
  Container,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { useAuth } from "../context/AuthContext";

const BookingStaffLayout = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [profileAnchor, setProfileAnchor] =
    useState(null);

  const [serviceAnchor, setServiceAnchor] =
    useState(null);

  const profileOpen = Boolean(profileAnchor);
  const serviceOpen = Boolean(serviceAnchor);

  const handleProfileClick = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  const handleServiceClick = (event) => {
    setServiceAnchor(event.currentTarget);
  };

  const handleServiceClose = () => {
    setServiceAnchor(null);
  };

  const handleLogout = async () => {
    handleProfileClose();

    await logout();

    navigate("/login");
  };

  const serviceItems = [
    {
      label: "Create Booking",
      path: "/booking-staff/create-booking",
    },
    {
      label: "Bookings",
      path: "/booking-staff/bookings",
    },
    {
      label: "Print Ticket",
      path: "/booking-staff/print-ticket",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
      }}
    >
      {/* ================= NAVBAR ================= */}

      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#07152f",
        }}
      >
        <Toolbar
          sx={{
            minHeight: "82px",
            px: {
              xs: 2,
              md: 6,
            },
          }}
        >
          {/* LOGO */}

          <Box
            onClick={() => navigate("/")}
            sx={{
              flexGrow: 1,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "0.2px",
                color: "#ffffff",
              }}
            >
              <Box
                component="span"
                sx={{ color: "#22c55e" }}
              >
                Green
              </Box>
              Bus
            </Typography>

            <Typography
              component="span"
              sx={{
                mt: 0.35,
                fontSize: { xs: "0.65rem", sm: "0.72rem" },
                fontWeight: 600,
                letterSpacing: "0.25px",
                color: "#fbbf24",
              }}
            >
              Bus management Service
            </Typography>
          </Box>

          {/* NAVIGATION */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* HOME */}

            <Box
              onClick={() => navigate("/")}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: 1,
                cursor: "pointer",

                "&:hover": {
                  backgroundColor:
                    "rgba(255,255,255,0.08)",
                },
              }}
            >
              HOME
            </Box>

            {/* ABOUT */}

            <Box
              onClick={() => navigate("/about")}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: 1,
                cursor: "pointer",

                "&:hover": {
                  backgroundColor:
                    "rgba(255,255,255,0.08)",
                },
              }}
            >
              ABOUT US
            </Box>

            {/* SERVICES */}

            <Box
              onClick={handleServiceClick}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: 1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 0.5,

                "&:hover": {
                  backgroundColor:
                    "rgba(255,255,255,0.08)",
                },
              }}
            >
              SERVICES

              <KeyboardArrowDownIcon
                sx={{ fontSize: 20 }}
              />
            </Box>

            <Menu
              anchorEl={serviceAnchor}
              open={serviceOpen}
              onClose={handleServiceClose}
            >
              {serviceItems.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => {
                    handleServiceClose();
                    navigate(item.path);
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>

            {/* PROFILE */}

            <Box
              onClick={handleProfileClick}
              sx={{
                ml: 2,
                pl: 2,
                pr: 1,
                borderLeft:
                  "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                cursor: "pointer",
                borderRadius: 2,
                py: 0.5,

                "&:hover": {
                  backgroundColor:
                    "rgba(255,255,255,0.08)",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 46,
                  height: 46,
                  backgroundColor: "#263653",
                  fontSize: 23,
                }}
              >
                👤
              </Avatar>

              <Box>
                <Typography
                  fontWeight={700}
                  fontSize={16}
                >
                  {user?.name || "Booking Staff"}
                </Typography>

                <Typography
                  fontSize={13}
                  sx={{
                    color: "#aab5c8",
                  }}
                >
                  (Booking Staff)
                </Typography>
              </Box>

              <KeyboardArrowDownIcon
                sx={{
                  color: "#d5dbea",
                }}
              />
            </Box>

            {/* PROFILE MENU */}

            <Menu
              anchorEl={profileAnchor}
              open={profileOpen}
              onClose={handleProfileClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleLogout}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ================= PAGE CONTENT ================= */}

      <Container
        maxWidth={false}
        sx={{
          py: 4,
          px: {
            xs: 2,
            md: 4,
          },
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};

export default BookingStaffLayout;