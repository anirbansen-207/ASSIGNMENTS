
import {
  registerService,
  verifyOTPService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  resendOTPservice,
  refreshTokenService,
  getProfileService,
  logoutService,
} from "../services/authServices.js";

import {
  registerValidation,
  loginValidation,
  otpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../validations/authValidation.js";

/*
 * Validate request data using the supplied Joi schema.
 */
const validateRequest = (schema, data) => {
  const { error } = schema.validate(data);

  return error ? error.details[0].message : null;
};

/*
 * Shared cookie settings.
 *
 * IMPORTANT:
 * path: "/" allows the cookies to be sent to every
 * API route, including /api/manager and /api/admin.
 */
const getCookieOptions = (maxAge) => {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge,
  };
};

/*
 * Older cookies may have been created with the default
 * path /api/auth. Clear those legacy cookies during logout.
 */
const getLegacyCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
  };
};

export const registerController = async (req, res) => {
  try {
    const validationError = validateRequest(
      registerValidation,
      req.body,
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    await registerService(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyOTPController = async (req, res) => {
  try {
    const validationError = validateRequest(
      otpValidation,
      req.body,
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const { email, otp } = req.body;

    const user = await verifyOTPService(email, otp);

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resendOTPcontroller = async (req, res) => {
  try {
    const validationError = validateRequest(
      forgotPasswordValidation,
      req.body,
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const { email } = req.body;

    await resendOTPservice(email);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const validationError = validateRequest(
      loginValidation,
      req.body,
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const { email, password } = req.body;

    const {
      user,
      accessToken,
      refreshToken,
    } = await loginService(email, password);

    // Set the access token for all application routes.
    res.cookie(
      "jwt",
      accessToken,
      getCookieOptions(15 * 60 * 1000),
    );

    // Set the refresh token for all application routes.
    res.cookie(
      "refreshToken",
      refreshToken,
      getCookieOptions(
        7 * 24 * 60 * 60 * 1000,
      ),
    );

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    const response = await logoutService(req);

    // Clear the current root-path cookies.
    res.clearCookie("jwt", getCookieOptions(0));
    res.clearCookie(
      "refreshToken",
      getCookieOptions(0),
    );

    // Clear cookies created by the previous /api/auth path.
    const legacyOptions = getLegacyCookieOptions();

    res.clearCookie("jwt", legacyOptions);
    res.clearCookie("refreshToken", legacyOptions);

    return res.status(response.statusCode).json({
      success: response.success,
      message: response.message,
      ...(response.code && {
        code: response.code,
      }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const validationError = validateRequest(
      forgotPasswordValidation,
      req.body,
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const { email } = req.body;

    await forgotPasswordService(email);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const validationError = validateRequest(
      resetPasswordValidation,
      req.body,
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const { email, otp, password } = req.body;

    await resetPasswordService(email, otp, password);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const response = await refreshTokenService(req);

    if (!response.success) {
      return res.status(response.statusCode).json({
        success: false,
        code: response.code,
        message: response.message,
      });
    }

    // Refresh the access token using the same root path.
    res.cookie(
      "jwt",
      response.accessToken,
      getCookieOptions(15 * 60 * 1000),
    );

    // Rotate the refresh token using the same root path.
    res.cookie(
      "refreshToken",
      response.refreshToken,
      getCookieOptions(
        7 * 24 * 60 * 60 * 1000,
      ),
    );

    return res.status(response.statusCode).json({
      success: true,
      message: response.message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const profileController = async (req, res) => {
  try {
    const response = await getProfileService(req.user);

    return res.status(response.statusCode).json({
      success: response.success,
      message: response.message,
      user: response.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};