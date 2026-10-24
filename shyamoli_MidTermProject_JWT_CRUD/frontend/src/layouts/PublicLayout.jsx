import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import {
  AppBar,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/roles";

const PublicLayout = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [profileAnchor, setProfileAnchor] =
    useState(null);

  const [serviceAnchor, setServiceAnchor] =
    useState(null);

  // =====================================================
  // PROFILE MENU
  // =====================================================

  const profileOpen = Boolean(profileAnchor);

  const handleProfileClick = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  // =====================================================
  // SERVICES MENU
  // =====================================================

  const serviceOpen = Boolean(serviceAnchor);

  const handleServiceClick = (event) => {
    setServiceAnchor(event.currentTarget);
  };

  const handleServiceClose = () => {
    setServiceAnchor(null);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    handleProfileClose();

    await logout();

    navigate("/login");
  };

  // =====================================================
  // ROLE NAME
  // =====================================================

  const getRoleName = () => {
    switch (user?.role) {
      case ROLES.SUPER_ADMIN:
        return "Super Admin";

      case ROLES.BOOKING_STAFF:
        return "Booking Staff";

      case ROLES.CUSTOMER:
        return "Customer";

      case ROLES.DRIVER:
        return "Driver";

      default:
        return user?.role || "";
    }
  };

  // =====================================================
  // ROLE BASED SERVICES
  // =====================================================

  const getServiceItems = () => {
    // -------------------------------------------------
    // SUPER ADMIN
    // -------------------------------------------------

    if (user?.role === ROLES.SUPER_ADMIN) {
      return [
        {
          label: "Routes",
          path: "/super-admin/routes",
        },
        {
          label: "Buses",
          path: "/super-admin/buses",
        },
        {
          label: "Seat Layouts",
          path: "/super-admin/seat-layouts",
        },
        {
          label: "Drivers",
          path: "/super-admin/drivers",
        },
        {
          label: "Booking Staff",
          path: "/super-admin/booking-staff",
        },
        {
          label: "Customers",
          path: "/super-admin/customers",
        },
        {
          label: "Trips",
          path: "/super-admin/trips",
        },
        {
          label: "Bookings",
          path: "/super-admin/bookings",
        },
      ];
    }

    // -------------------------------------------------
    // BOOKING STAFF
    // -------------------------------------------------

    if (user?.role === ROLES.BOOKING_STAFF) {
      return [
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
    }

    // -------------------------------------------------
    // CUSTOMER
    // -------------------------------------------------

    if (user?.role === ROLES.CUSTOMER) {
      return [
        {
          label: "Trips",
          path: "/customer/trips",
        },
        {
          label: "My Bookings",
          path: "/customer/bookings",
        },
        {
          label: "My Tickets",
          path: "/customer/tickets",
        },
      ];
    }

    // -------------------------------------------------
    // DRIVER
    // -------------------------------------------------

    if (user?.role === ROLES.DRIVER) {
      return [
        {
          label: "Assigned Trips",
          path: "/driver",
        },
      ];
    }

    return [];
  };

  const serviceItems = getServiceItems();

  // =====================================================
  // DASHBOARD
  // =====================================================

  const handleDashboard = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    switch (user.role) {
      case ROLES.SUPER_ADMIN:
        navigate("/super-admin");
        break;

      case ROLES.BOOKING_STAFF:
        navigate("/booking-staff");
        break;

      case ROLES.CUSTOMER:
        navigate("/customer");
        break;

      case ROLES.DRIVER:
        navigate("/driver");
        break;

      default:
        navigate("/");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f7fb",
      }}
    >
      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#07152f",
        }}
      >
        <Toolbar
          sx={{
            minHeight: "82px !important",
            px: {
              xs: 2,
              md: 6,
            },
          }}
        >
          {/* ================================================= */}
          {/* LOGO */}
          {/* ================================================= */}

          <Box
            onClick={() => navigate("/")}
            sx={{
              flexGrow: 1,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              lineHeight: 1.1,
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "0.2px",
                lineHeight: 1.1,
              }}
            >
              <Box component="span" sx={{ color: "#22c55e" }}>Green</Box>Bus
            </Typography>
            <Typography
              component="span"
              sx={{
                mt: 0.25,
                fontSize: { xs: "0.65rem", sm: "0.72rem" },
                fontWeight: 600,
                color: "#fbbf24",
                letterSpacing: "0.25px",
              }}
            >
              Bus management Service
            </Typography>
          </Box>

          {/* ================================================= */}
          {/* NAVIGATION */}
          {/* ================================================= */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* ================================================= */}
            {/* HOME */}
            {/* ================================================= */}

            <Box
              onClick={() => navigate("/")}
              sx={{
                px: 2,
                py: 1.1,
                borderRadius: 1,
                cursor: "pointer",
                color: "#ffffff",

                "&:hover": {
                  backgroundColor: "#263653",
                },
              }}
            >
              HOME
            </Box>

            {/* ================================================= */}
            {/* ABOUT US */}
            {/* ================================================= */}

            <Box
              onClick={() => navigate("/about")}
              sx={{
                px: 2,
                py: 1.1,
                borderRadius: 1,
                cursor: "pointer",
                color: "#ffffff",

                "&:hover": {
                  backgroundColor: "#263653",
                },
              }}
            >
              ABOUT US
            </Box>

            {/* ================================================= */}
            {/* SERVICES */}
            {/* ================================================= */}

            {user && serviceItems.length > 0 && (
              <>
                <Box
                  onClick={handleServiceClick}
                  sx={{
                    px: 2,
                    py: 1.1,
                    borderRadius: 1,
                    cursor: "pointer",
                    color: "#ffffff",

                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,

                    "&:hover": {
                      backgroundColor: "#263653",
                    },
                  }}
                >
                  SERVICES

                  <KeyboardArrowDownIcon
                    sx={{
                      fontSize: 20,
                    }}
                  />
                </Box>

                <Menu
                  anchorEl={serviceAnchor}
                  open={serviceOpen}
                  onClose={handleServiceClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
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
              </>
            )}

            {/* ================================================= */}
            {/* DASHBOARD */}
            {/* ================================================= */}

            {user && (
              <Box
                onClick={handleDashboard}
                sx={{
                  px: 2,
                  py: 1.1,
                  borderRadius: 1,
                  cursor: "pointer",
                  color: "#ffffff",

                  "&:hover": {
                    backgroundColor: "#263653",
                  },
                }}
              >
                DASHBOARD
              </Box>
            )}

            {/* ================================================= */}
            {/* LOGIN / REGISTER */}
            {/* ================================================= */}

            {!user && (
              <>
                <Box
                  onClick={() => navigate("/login")}
                  sx={{
                    px: 2,
                    py: 1.1,
                    borderRadius: 1,
                    cursor: "pointer",
                    color: "#ffffff",

                    "&:hover": {
                      backgroundColor: "#263653",
                    },
                  }}
                >
                  LOGIN
                </Box>

                <Box
                  onClick={() => navigate("/register")}
                  sx={{
                    px: 2,
                    py: 1.1,
                    borderRadius: 1,
                    cursor: "pointer",
                    color: "#ffffff",

                    "&:hover": {
                      backgroundColor: "#263653",
                    },
                  }}
                >
                  REGISTER
                </Box>
              </>
            )}

            {/* ================================================= */}
            {/* USER PROFILE */}
            {/* ================================================= */}

            {user && (
              <>
                <Box
                  onClick={handleProfileClick}
                  sx={{
                    ml: 1,
                    pl: 2,
                    pr: 1,

                    borderLeft:
                      "1px solid rgba(255,255,255,0.18)",

                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,

                    cursor: "pointer",

                    borderRadius: 2,

                    py: 0.6,

                    "&:hover": {
                      backgroundColor:
                        "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  {/* PERSON ICON */}

                  <Avatar
                    sx={{
                      width: 46,
                      height: 46,
                      backgroundColor: "#263653",
                      fontSize: 22,
                    }}
                  >
                    👤
                  </Avatar>

                  {/* NAME + ROLE */}

                  <Box>
                    <Typography
                      sx={{
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: 16,
                        lineHeight: 1.2,
                      }}
                    >
                      {user?.name || "User"}
                    </Typography>

                    <Typography
                      sx={{
                        color: "#aeb9cc",
                        fontSize: 13,
                        mt: 0.3,
                      }}
                    >
                      ({getRoleName()})
                    </Typography>
                  </Box>

                  <KeyboardArrowDownIcon
                    sx={{
                      color: "#ffffff",
                    }}
                  />
                </Box>

                {/* ================================================= */}
                {/* PROFILE DROPDOWN */}
                {/* ================================================= */}

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
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      minWidth: 120,
                    }}
                  >
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ================================================= */}
      {/* PAGE CONTENT */}
      {/* ================================================= */}

      <Box
        component="main"
        sx={{
          flex: 1,
          width: "100%",
        }}
      >
        <Outlet />
      </Box>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <Box
        component="footer"
        sx={{
          backgroundColor: "#07152f",
          color: "#ffffff",
          mt: "auto",
        }}
      >
        <Box
          sx={{
            maxWidth: "1200px",
            margin: "0 auto",
            px: {
              xs: 3,
              md: 6,
            },
            py: 5,
          }}
        >
          {/* FOOTER TOP */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: {
                xs: "flex-start",
                md: "center",
              },
              flexDirection: {
                xs: "column",
                md: "row",
              },
              gap: 3,
            }}
          >
            {/* BRAND */}

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  mb: 0.25,
                  lineHeight: 1.1,
                }}
              >
                <Box component="span" sx={{ color: "#22c55e" }}>Green</Box>Bus
              </Typography>

              <Typography
                sx={{
                  color: "#fbbf24",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Bus management Service
              </Typography>
            </Box>

            {/* DESIGNER CREDIT */}
            <Typography
              sx={{
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                alignSelf: { xs: "flex-start", md: "center" },
              }}
            >
              Designed By: Anirban Sen
            </Typography>
          </Box>

          {/* ================================================= */}
          {/* FOOTER DIVIDER */}
          {/* ================================================= */}

          <Box
            sx={{
              borderTop:
                "1px solid rgba(255,255,255,0.15)",
              mt: 4,
              pt: 2.5,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                color: "#aeb9cc",
                fontSize: 13,
              }}
            >
              Designed By: Anirban Sen
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PublicLayout;