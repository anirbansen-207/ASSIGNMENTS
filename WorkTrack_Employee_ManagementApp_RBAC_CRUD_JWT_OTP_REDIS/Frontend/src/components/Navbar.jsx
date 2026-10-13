
import {
  NavLink,
} from "react-router-dom";

import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";

import {
  WorkspacesRounded,
} from "@mui/icons-material";

const Navbar = () => {
  const links = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "About",
      path: "/about",
    },
    {
      label: "Contact",
      path: "/contact",
    },
  ];

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        flexShrink: 0,
        width: "100%",
        backgroundColor: "#101d34",
        color: "white",
        borderBottom:
          "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: {
              xs: 64,
              sm: 76,
            },
            gap: 2,
          }}
        >
          {/* WorkTrack branding */}
          <Box
            component={NavLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "white",
              flexGrow: 1,
              minWidth: 0,
            }}
          >
            <WorkspacesRounded
              sx={{
                color: "#69b1ff",
                fontSize: 30,
                flexShrink: 0,
              }}
            />

            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                fontSize: {
                  xs: "1.2rem",
                  sm: "1.5rem",
                },
              }}
            >
              WorkTrack
            </Typography>
          </Box>

          {/* Public navigation links */}
          <Box
            sx={{
              display: "flex",
              gap: {
                xs: 0,
                sm: 1,
              },
              flexShrink: 0,
            }}
          >
            {links.map((link) => (
              <Button
                key={link.path}
                component={NavLink}
                to={link.path}
                sx={{
                  color: "white",
                  minWidth: 0,
                  px: {
                    xs: 0.8,
                    sm: 1.8,
                  },
                  fontSize: {
                    xs: "0.75rem",
                    sm: "0.875rem",
                  },
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 1.5,
                  "&.active": {
                    color: "#86c1ff",
                    backgroundColor:
                      "rgba(255,255,255,0.08)",
                  },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;