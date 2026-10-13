import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  forgotPasswordController,
  registerController,
  loginController,
  logoutController,
  verifyOTPController,
  resendOTPcontroller,
  refreshTokenController,
  profileController,
  resetPasswordController,
} from "../controllers/authController.js";

const router = express.Router();

// register route
router.post("/register", registerController);

// OTP verification
router.post("/verifyOTP", verifyOTPController);

// Resend OTP
router.post("/resendOTP", resendOTPcontroller);

// login route
router.post("/login", loginController);

// logout route
router.post("/logout", logoutController);

// forgot password
router.post("/forgot-password", forgotPasswordController);

// reset password
router.post("/reset-password", resetPasswordController);

// refresh token
router.post("/refresh-token", refreshTokenController);

// profile route
router.get("/profile", authMiddleware, profileController);

export default router;
