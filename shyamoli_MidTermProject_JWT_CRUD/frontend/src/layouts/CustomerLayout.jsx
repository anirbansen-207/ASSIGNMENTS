import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";

import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const CustomerLayout = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  // Controls the profile dropdown
  const [anchorEl, setAnchorEl] = useState(null);

  const menuOpen = Boolean(anchorEl);

  // Open profile menu
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close profile menu
  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  // Logout
  const handleLogout = async () => {
    handleProfileClose();

    await logout();

    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
      }}
    >
      {/* ================= NAVBAR ================= */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#06142f",
        }}
      >
        <Toolbar
          sx={{
            minHeight: "84px",
            px: {
              xs: 2,
              md: 6,
            },
          }}
        >
          {/* Logo / Website Name */}
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

          {/* Dashboard */}
          <Button
            color="inherit"
            sx={{
              mx: 0.5,
              fontSize: "15px",
              fontWeight: 500,
            }}
            onClick={() => navigate("/customer")}
          >
            DASHBOARD
          </Button>

          {/* Book Ticket */}
          <Button
            color="inherit"
            sx={{
              mx: 0.5,
              fontSize: "15px",
              fontWeight: 500,
            }}
            onClick={() => navigate("/customer/trips")}
          >
            BOOK TICKET
          </Button>

          {/* My Bookings */}
          <Button
            color="inherit"
            sx={{
              mx: 0.5,
              fontSize: "15px",
              fontWeight: 500,
            }}
            onClick={() => navigate("/customer/bookings")}
          >
            MY BOOKINGS
          </Button>

          {/* My Tickets */}
          <Button
            color="inherit"
            sx={{
              mx: 0.5,
              fontSize: "15px",
              fontWeight: 500,
            }}
            onClick={() => navigate("/customer/tickets")}
          >
            MY TICKETS
          </Button>

          {/* ================= PROFILE ================= */}
          <Box
            sx={{
              ml: 2,
              pl: 2,
              borderLeft: "1px solid rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconButton
              onClick={handleProfileClick}
              sx={{
                p: 0.5,
                color: "#ffffff",
              }}
            >
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  backgroundColor: "#263653",
                }}
              >
                👤
              </Avatar>
            </IconButton>

            <Box
              sx={{
                ml: 1,
                mr: 1,
                cursor: "pointer",
              }}
              onClick={handleProfileClick}
            >
              <Typography
                sx={{
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: 1.2,
                }}
              >
                {user?.name || "Customer"}
              </Typography>

              <Typography
                sx={{
                  color: "#b9c2d0",
                  fontSize: "14px",
                }}
              >
                (Customer)
              </Typography>
            </Box>
          </Box>

          {/* Profile dropdown arrow */}
          <IconButton
            onClick={handleProfileClick}
            sx={{
              color: "#ffffff",
            }}
          >
            <span
              style={{
                fontSize: "20px",
              }}
            >
              ⌄
            </span>
          </IconButton>

          {/* ================= LOGOUT MENU ================= */}
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
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
        </Toolbar>
      </AppBar>

      {/* ================= PAGE CONTENT ================= */}
      <Box
        sx={{
          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default CustomerLayout;