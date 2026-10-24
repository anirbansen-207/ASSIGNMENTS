
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import {
  Person,
  EmailOutlined,
  LockOutlined,
  PhoneOutlined,
  Visibility,
  VisibilityOff,
  ArrowBack,
} from "@mui/icons-material";

import { registerCustomer } from "../../services/authService";
import busHero from "../../assets/bus-hero.png";

const Register = () => {
  const navigate = useNavigate();

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Register customer and navigate to OTP verification
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      await registerCustomer(formData);

      navigate("/verify-otp", {
        state: {
          email: formData.email,
        },
      });
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        // Use the same bus background as the Login page
        minHeight: "calc(100vh - 82px)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        py: { xs: 4, md: 6 },
        px: 2,

        backgroundImage: `url(${busHero})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        // Dark overlay improves contrast and matches GreenBus branding
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(5,18,42,0.93) 0%, rgba(5,18,42,0.78) 55%, rgba(5,18,42,0.62) 100%)",
          zIndex: 0,
        },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Card
          elevation={16}
          sx={{
            width: "100%",
            maxWidth: 500,
            borderRadius: 4,
            overflow: "hidden",
            backgroundColor: "#ffffff",
            boxShadow: "0 24px 65px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          {/* Registration header */}
          <Box
            sx={{
              background:
                "linear-gradient(135deg, #07152f 0%, #102b50 100%)",
              color: "white",
              textAlign: "center",
              px: 3,
              py: { xs: 3.5, md: 4 },
              position: "relative",
              overflow: "hidden",

              "&::before": {
                content: '""',
                position: "absolute",
                width: 180,
                height: 180,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.08)",
                top: -100,
                right: -50,
              },

              "&::after": {
                content: '""',
                position: "absolute",
                width: 130,
                height: 130,
                borderRadius: "50%",
                backgroundColor: "rgba(34,197,94,0.06)",
                bottom: -80,
                left: -35,
              },
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "#263653",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
                position: "relative",
                zIndex: 1,
              }}
            >
              <Person sx={{ fontSize: 34, color: "#ffffff" }} />
            </Box>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.8rem", sm: "2rem" },
                position: "relative",
                zIndex: 1,
              }}
            >
              Create Account
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "#c5d2e5",
                fontSize: "0.95rem",
                position: "relative",
                zIndex: 1,
              }}
            >
              Create your GreenBus account
            </Typography>
          </Box>

          {/* Registration form */}
          <CardContent
            sx={{
              p: { xs: 2.5, sm: 4 },
              backgroundColor: "#ffffff",
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2.5 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Full name */}
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                placeholder="Enter your full name"
                autoComplete="name"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Email address */}
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                placeholder="Enter your email"
                autoComplete="email"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Phone number */}
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                margin="normal"
                placeholder="Enter your phone number"
                autoComplete="tel"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlined />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password */}
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                placeholder="Create a password"
                autoComplete="new-password"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        onClick={() =>
                          setShowPassword((previous) => !previous)
                        }
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Register button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 2,
                  backgroundColor: "#07152f",
                  fontSize: 15,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  boxShadow: "0 4px 10px rgba(7,21,47,0.18)",
                  "&:hover": {
                    backgroundColor: "#10254b",
                    boxShadow: "0 6px 16px rgba(7,21,47,0.25)",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#9aa6b8",
                    color: "#ffffff",
                  },
                }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              {/* Login divider */}
              <Divider sx={{ my: 3 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", px: 0.5 }}
                >
                  Already have an account?
                </Typography>
              </Divider>

              {/* Login button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  py: 1.3,
                  borderRadius: 2,
                  borderColor: "#07152f",
                  color: "#07152f",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  "&:hover": {
                    borderColor: "#07152f",
                    backgroundColor: "#f2f5fa",
                  },
                }}
              >
                Login
              </Button>

              {/* Back to home */}
              <Button
                fullWidth
                startIcon={<ArrowBack />}
                onClick={() => navigate("/")}
                sx={{
                  mt: 1,
                  py: 1,
                  color: "#526079",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#f4f7fb",
                  },
                }}
              >
                Back to Home
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;
