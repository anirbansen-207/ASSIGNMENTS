
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material";

import {
  WorkspacesRounded,
  MarkEmailReadRounded,
  VerifiedUserRounded,
  RefreshRounded,
  ArrowForwardRounded,
  ArrowBackRounded,
  EmailRounded,
  PasswordRounded,
} from "@mui/icons-material";

import { useMutation } from "@tanstack/react-query";

import {
  verifyOTPApi,
  resendOTPApi,
} from "../../api/otpAPI";

const VerifyAccount = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });

  const [resendSuccess, setResendSuccess] = useState("");

  const {
    mutate: verifyOTP,
    isPending: isVerifying,
    error: verifyError,
    reset: resetVerify,
  } = useMutation({
    mutationFn: ({ email, otp }) => verifyOTPApi(email, otp),

    onSuccess: () => {
      navigate("/login", { replace: true });
    },
  });

  const {
    mutate: resendOTP,
    isPending: isResending,
    error: resendError,
    reset: resetResend,
  } = useMutation({
    mutationFn: () => resendOTPApi(formData.email.trim()),

    onSuccess: (response) => {
      setResendSuccess(
        response?.message ||
          "A new OTP has been requested. Please check your email.",
      );
    },
  });

  // Update form fields and clear stale messages when the user edits.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: name === "email" ? value : value.replace(/\s/g, ""),
    }));

    setResendSuccess("");
    resetVerify();
    resetResend();
  };

  // Verify the entered OTP using the existing API.
  const handleSubmit = (event) => {
    event.preventDefault();

    setResendSuccess("");
    resetResend();

    verifyOTP({
      email: formData.email.trim(),
      otp: formData.otp.trim(),
    });
  };

  // Request another OTP for the entered email address.
  const handleResendOTP = () => {
    setResendSuccess("");
    resetResend();
    resetVerify();

    resendOTP();
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
          {/* Introduction section for larger screens */}
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
                One step closer.
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    color: "#86c1ff",
                  }}
                >
                  Verify your account.
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
                Confirm your email address to activate your
                WorkTrack account and access your workspace.
                Enter the OTP sent to your email address.
              </Typography>

              <Stack spacing={2} sx={{ pt: 1 }}>
                {[
                  "Secure email verification",
                  "Account activation",
                  "Access to your WorkTrack workspace",
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
                        backgroundColor: "rgba(134,193,255,0.12)",
                      }}
                    >
                      <VerifiedUserRounded fontSize="small" />
                    </Box>

                    <Typography color="#d5dfed">
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Box>

          {/* Verification form */}
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 480,
              justifySelf: "center",
              p: { xs: 3, sm: 4 },
              borderRadius: 4,
              color: "#172033",
              backgroundColor: "#ffffff",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.25)",
            }}
          >
            <Stack spacing={3}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 3,
                  color: "#1976d2",
                  backgroundColor: "#eaf3ff",
                }}
              >
                <MarkEmailReadRounded sx={{ fontSize: 34 }} />
              </Box>

              <Box>
                <Typography
                  component="h2"
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    fontSize: { xs: 27, sm: 32 },
                    letterSpacing: "-0.025em",
                    mb: 1,
                  }}
                >
                  Verify your account
                </Typography>

                <Typography color="text.secondary" lineHeight={1.8}>
                  Enter your registered email address and the OTP
                  you received to complete account verification.
                </Typography>
              </Box>

              {verifyError && (
                <Alert severity="error">
                  {verifyError.response?.data?.message ||
                    verifyError.message ||
                    "Account verification failed. Please try again."}
                </Alert>
              )}

              {resendError && (
                <Alert severity="error">
                  {resendError.response?.data?.message ||
                    resendError.message ||
                    "Unable to resend OTP. Please try again."}
                </Alert>
              )}

              {resendSuccess && (
                <Alert severity="success">
                  {resendSuccess}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Email address"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    disabled={isVerifying}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailRounded color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Verification OTP"
                    name="otp"
                    type="text"
                    placeholder="Enter the OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    autoComplete="one-time-code"
                    required
                    disabled={isVerifying}
                    inputProps={{
                      inputMode: "numeric",
                      maxLength: 10,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PasswordRounded color="action" />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Enter the OTP sent to your email."
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={
                      isVerifying ||
                      !formData.email.trim() ||
                      !formData.otp.trim()
                    }
                    endIcon={
                      isVerifying ? (
                        <CircularProgress size={19} color="inherit" />
                      ) : (
                        <ArrowForwardRounded />
                      )
                    }
                    sx={{
                      py: 1.4,
                      mt: 1,
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: 16,
                      fontWeight: 700,
                      boxShadow: "none",
                      "&:hover": {
                        boxShadow: "0 6px 18px rgba(25,118,210,0.25)",
                      },
                    }}
                  >
                    {isVerifying
                      ? "Verifying account..."
                      : "Verify Account"}
                  </Button>
                </Stack>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Didn't receive the OTP?
                </Typography>

                <Button
                  type="button"
                  variant="text"
                  onClick={handleResendOTP}
                  disabled={
                    isResending ||
                    isVerifying ||
                    !formData.email.trim()
                  }
                  startIcon={
                    isResending ? (
                      <CircularProgress size={15} />
                    ) : (
                      <RefreshRounded />
                    )
                  }
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    minWidth: "auto",
                  }}
                >
                  {isResending ? "Sending..." : "Resend OTP"}
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.75,
                  pt: 1,
                  borderTop: "1px solid #e7ebf0",
                }}
              >
                <Button
                  component={Link}
                  to="/login"
                  startIcon={<ArrowBackRounded />}
                  sx={{
                    textTransform: "none",
                    color: "text.secondary",
                    fontWeight: 600,
                  }}
                >
                  Back to Login
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default VerifyAccount;
