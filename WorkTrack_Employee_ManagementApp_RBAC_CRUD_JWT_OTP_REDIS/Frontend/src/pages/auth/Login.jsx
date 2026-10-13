
import { useState } from "react";
import { useNavigate} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

import {
  VisibilityRounded,
  VisibilityOffRounded,
  LockOutlined,
  ArrowForwardRounded,
  WorkspacesRounded,
  ShieldRounded,
} from "@mui/icons-material";

import axiosInstance from "../../api/axios";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();

  const { setUser } = useAuth();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Update the field that the user changes.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setLoginData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    // Clear the previous error when the user edits the form.
    if (error) {
      setError("");
    }
  };

  // Authenticate the user and redirect according to their role.
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        "/api/auth/login",
        {
          email: loginData.email.trim(),
          password: loginData.password,
        },
      );

      const user = response.data.user;

      // Do not continue if the expected user data is missing.
      if (!user || !user.role) {
        throw new Error(
          "Login response did not contain valid user information.",
        );
      }

      setUser(user);

      // Send each role to its own dashboard.
      const dashboardByRole = {
        admin: "/admin/dashboard",
        manager: "/manager/dashboard",
        employee: "/employee/dashboard",
      };

      const destination = dashboardByRole[user.role];

      if (!destination) {
        setUser(null);
        setError(
          "Your account has an unrecognized role. Please contact the administrator.",
        );
        return;
      }

      navigate(destination, { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to log in. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 4, md: 6 },
        color: "#ffffff",
        background:
          "radial-gradient(ellipse at 15% 10%, #1e416f 0%, #101d34 48%, #091222 100%)",
        overflowX: "clip",
      }}
    >
      <Container
        maxWidth="lg"
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1fr) minmax(380px, 0.8fr)",
            },
            alignItems: "center",
            gap: { xs: 4, md: 8 },
          }}
        >
          {/* Welcome section shown beside the login card on larger screens. */}
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              py: 4,
            }}
          >
            <Stack spacing={3}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  color: "#86c1ff",
                }}
              >
                <WorkspacesRounded sx={{ fontSize: 34 }} />

                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="#ffffff"
                >
                  WorkTrack
                </Typography>
              </Box>

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    md: "3rem",
                    lg: "3.7rem",
                  },
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: "-0.035em",
                }}
              >
                Welcome back.
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    color: "#86c1ff",
                  }}
                >
                  Let's get to work.
                </Box>
              </Typography>

              <Typography
                sx={{
                  maxWidth: 470,
                  color: "#c4d0e2",
                  fontSize: 17,
                  lineHeight: 1.9,
                }}
              >
                Access your workspace to manage teams,
                track tasks, review attendance, and stay
                up to date with your work.
              </Typography>

              <Stack spacing={2} sx={{ pt: 1 }}>
                {[
                  "Organized employee and team management",
                  "Task progress and work coordination",
                  "Attendance and leave management",
                ].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        color: "#86c1ff",
                        backgroundColor:
                          "rgba(134,193,255,0.12)",
                      }}
                    >
                      <ShieldRounded sx={{ fontSize: 17 }} />
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{ color: "#d3deed" }}
                    >
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Box>

          {/* Login form */}
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 480,
              justifySelf: { xs: "center", md: "end" },
              p: { xs: 3, sm: 4, md: 4.5 },
              borderRadius: 4,
              color: "#ffffff",
              backgroundColor: "rgba(31, 45, 67, 0.94)",
              border:
                "1px solid rgba(255,255,255,0.13)",
              boxShadow:
                "0 24px 70px rgba(0,0,0,0.22)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Box
              sx={{
                width: 54,
                height: 54,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 3,
                backgroundColor:
                  "rgba(105,177,255,0.15)",
                color: "#86c1ff",
                mb: 2.5,
              }}
            >
              <LockOutlined sx={{ fontSize: 29 }} />
            </Box>

            <Typography
              component="h2"
              sx={{
                fontSize: { xs: 27, sm: 30 },
                fontWeight: 750,
                letterSpacing: "-0.02em",
              }}
            >
              Sign in to WorkTrack
            </Typography>

            <Typography
              sx={{
                mt: 1,
                mb: 3.5,
                color: "#b9c7da",
                lineHeight: 1.8,
              }}
            >
              Enter your account details to access your
              dashboard.
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2.5,
                  borderRadius: 2,
                  overflowWrap: "anywhere",
                }}
              >
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
            >
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  name="email"
                  label="Email address"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={loginData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  slotProps={{
                    input: {
                      sx: { borderRadius: 2 },
                    },
                  }}
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: "#bdc9da",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#86c1ff",
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "#ffffff",
                      backgroundColor:
                        "rgba(255,255,255,0.035)",
                      "& fieldset": {
                        borderColor:
                          "rgba(255,255,255,0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "#86c1ff",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#86c1ff",
                      },
                    },
                    "& input::placeholder": {
                      color: "#9baec6",
                      opacity: 1,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  required
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={loginData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  slotProps={{
                    input: {
                      sx: { borderRadius: 2 },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            onClick={() =>
                              setShowPassword((previous) => !previous)
                            }
                            edge="end"
                            disabled={isLoading}
                            sx={{ color: "#bdc9da" }}
                          >
                            {showPassword ? (
                              <VisibilityOffRounded />
                            ) : (
                              <VisibilityRounded />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: "#bdc9da",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#86c1ff",
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "#ffffff",
                      backgroundColor:
                        "rgba(255,255,255,0.035)",
                      "& fieldset": {
                        borderColor:
                          "rgba(255,255,255,0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "#86c1ff",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#86c1ff",
                      },
                    },
                    "& input::placeholder": {
                      color: "#9baec6",
                      opacity: 1,
                    },
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: -0.5,
                  }}
                >
                  <Button
                    type="button"
                    onClick={() =>
                      navigate("/forgot-password")
                    }
                    disabled={isLoading}
                    sx={{
                      p: 0,
                      minWidth: 0,
                      color: "#86c1ff",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        backgroundColor: "transparent",
                        color: "#b3d8ff",
                      },
                    }}
                  >
                    Forgot password?
                  </Button>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  endIcon={
                    isLoading ? (
                      <CircularProgress
                        size={19}
                        color="inherit"
                      />
                    ) : (
                      <ArrowForwardRounded />
                    )
                  }
                  sx={{
                    mt: 1,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: 16,
                    fontWeight: 700,
                    backgroundColor: "#1976d2",
                    boxShadow:
                      "0 8px 20px rgba(25,118,210,0.22)",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                    },
                    "&.Mui-disabled": {
                      color: "#d1d9e5",
                      backgroundColor: "#365a80",
                    },
                  }}
                >
                  {isLoading ? "Signing in..." : "Login to Dashboard"}
                </Button>
              </Stack>
            </Box>

            <Divider
              sx={{
                my: 3,
                borderColor:
                  "rgba(255,255,255,0.12)",
              }}
            />

            <Typography
              variant="body2"
              textAlign="center"
              sx={{
                color: "#aebfd5",
                lineHeight: 1.8,
              }}
            >
              Secure access for administrators, managers,
              and employees.
            </Typography>

            <Typography
              variant="body2"
              textAlign="center"
              sx={{
                display: { xs: "block", md: "none" },
                mt: 2,
                color: "#aebfd5",
              }}
            >
              WorkTrack — Employee & Task Management
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;