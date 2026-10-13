
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowForwardRounded,
  LoginRounded,
  VerifiedUserRounded,
  GroupsRounded,
  TaskAltRounded,
  AccessTimeRounded,
} from "@mui/icons-material";

import {
  useNavigate,
} from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <GroupsRounded />,
      label: "Team Management",
    },
    {
      icon: <TaskAltRounded />,
      label: "Task Tracking",
    },
    {
      icon: <AccessTimeRounded />,
      label: "Attendance",
    },
  ];

  return (
    <Box className="home-page">
      <Container
        maxWidth="xl"
        sx={{
          minHeight: {
            xs: "auto",
            md: "calc(100vh - 124px)",
          },
          display: "flex",
          alignItems: "center",
          py: {
            xs: 5,
            sm: 6,
            md: 5,
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: "minmax(0, 1.2fr) minmax(320px, 0.8fr)",
            },
            gap: {
              xs: 5,
              md: 8,
            },
            alignItems: "center",
          }}
        >
          {/* Main welcome section */}
          <Box
            sx={{
              minWidth: 0,
              py: {
                xs: 0,
                md: 3,
              },
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: "#8dc4ff",
                fontWeight: 700,
                letterSpacing: {
                  xs: 1.5,
                  sm: 2.5,
                },
                fontSize: {
                  xs: "0.65rem",
                  sm: "0.75rem",
                },
              }}
            >
              EMPLOYEE & TASK MANAGEMENT SYSTEM
            </Typography>

            <Typography
              component="h1"
              sx={{
                fontSize: {
                  xs: "2.5rem",
                  sm: "3.5rem",
                  lg: "4.5rem",
                },
                lineHeight: 1.12,
                fontWeight: 800,
                letterSpacing: "-0.035em",
                mt: 2,
                mb: 3,
                overflowWrap: "break-word",
              }}
            >
              Manage work.
              <Box
                component="span"
                sx={{
                  display: "block",
                  color: "#86c1ff",
                }}
              >
                Empower teams.
              </Box>
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: 16,
                  md: 19,
                },
                lineHeight: 1.8,
                color: "#c4d0e2",
                maxWidth: 590,
              }}
            >
              WorkTrack brings employees,
              teams, tasks, attendance and
              leave management together in
              one organized workspace.
            </Typography>

            {/* Feature highlights */}
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              sx={{
                mt: 4,
              }}
            >
              {features.map((feature) => (
                <Box
                  key={feature.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2,
                    border:
                      "1px solid rgba(255,255,255,0.16)",
                    backgroundColor:
                      "rgba(255,255,255,0.05)",
                    color: "#e1eaf6",
                    maxWidth: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      color: "#86c1ff",
                    }}
                  >
                    {feature.icon}
                  </Box>

                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    {feature.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Transparent authentication panel */}
          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 3,
                sm: 4,
                md: 5,
              },
              borderRadius: 4,
              backgroundColor:
                "rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border:
                "1px solid rgba(255,255,255,0.18)",
              boxShadow:
                "0 24px 60px rgba(0,0,0,0.2)",
              color: "white",
              width: "100%",
              maxWidth: 480,
              minWidth: 0,
              mx: "auto",
            }}
          >
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: 3,
                backgroundColor:
                  "rgba(105,177,255,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <VerifiedUserRounded
                sx={{
                  color: "#8dc4ff",
                  fontSize: 32,
                }}
              />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontSize: {
                  xs: "1.7rem",
                  sm: "2rem",
                },
                fontWeight: 700,
                mb: 1.5,
              }}
            >
              Welcome to WorkTrack
            </Typography>

            <Typography
              sx={{
                color: "#c4d0e2",
                mb: 4,
                lineHeight: 1.7,
              }}
            >
              Sign in to access your
              workspace, or verify your
              account to get started.
            </Typography>

            <Stack spacing={2}>
              {/* Navigate to the existing login page */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<LoginRounded />}
                endIcon={<ArrowForwardRounded />}
                onClick={() => navigate("/login")}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: 16,
                  borderRadius: 2,
                  backgroundColor: "#1976d2",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                }}
              >
                Login to Dashboard
              </Button>

              {/* Navigate to the existing verification page */}
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<VerifiedUserRounded />}
                onClick={() =>
                  navigate("/verify-account")
                }
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: 16,
                  borderRadius: 2,
                  color: "white",
                  borderColor:
                    "rgba(255,255,255,0.45)",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor:
                      "rgba(255,255,255,0.08)",
                  },
                }}
              >
                Verify Account
              </Button>
            </Stack>

            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                color: "#aabbd2",
                mt: 3,
                lineHeight: 1.6,
              }}
            >
              Secure access for admins,
              managers and employees.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;