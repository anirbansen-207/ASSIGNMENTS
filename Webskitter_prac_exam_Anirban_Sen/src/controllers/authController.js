import * as authService from "../services/authService.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/"
};

const sendError = (res, error) => {
  const message = error.message || "Something went wrong";
  const status = message.includes("secret or public key") ? 500 : 400;

  return res.status(status).json({
    success: false,
    message
  });
};

export const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.loginUser(
      req.body.email,
      req.body.password
    );

    res.cookie("accessToken", result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      }
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const result = await authService.refreshUserToken(
      req.cookies.refreshToken
    );

    res.cookie("accessToken", result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully"
    });
  } catch (error) {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(401).json({
      success: false,
      message: "Refresh token is invalid or expired"
    });
  }
};

export const logout = async (req, res) => {
  try {
    await authService.logoutUser(req.user._id);

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    return sendError(res, error);
  }
};