import {
  useState,
} from "react";

import {
  Menu,
} from "@mui/icons-material";

import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";

import {
  Outlet,
} from "react-router-dom";

import useAuth from "../hooks/useAuth";

import Sidebar, {
  drawerWidth,
} from "../components/Sidebar";

function DashboardLayout() {
  const {
    user,
  } = useAuth();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  /*
   * DashboardLayout provides the common
   * layout for admin, manager and employee.
   */
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor:
          "background.default",
      }}
    >
      {/* Role-based sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        {/* Mobile top bar */}
        <AppBar
          position="sticky"
          color="inherit"
          elevation={1}
          sx={{
            display: {
              xs: "block",
              md: "none",
            },
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() =>
                setMobileOpen(true)
              }
              aria-label="open navigation"
              sx={{
                mr: 1,
              }}
            >
              <Menu />
            </IconButton>

            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                flexGrow: 1,
              }}
            >
              WorkTrack
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textTransform:
                  "capitalize",
              }}
            >
              {user?.role}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Child page is rendered here */}
        <Box
          sx={{
            p: {
              xs: 2,
              sm: 3,
              lg: 4,
            },

            /*
             * Prevent extremely wide dashboard
             * content on large screens.
             */
            maxWidth: {
              xl: `calc(100vw - ${drawerWidth}px)`,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;