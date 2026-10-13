import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (
  req,
  res,
  next,
) => {
  try {
    const token =
      req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        code: "NO_TOKEN",
        message: "no token found",
      });
    }

    const decoded =
      jwt.verify(
        token,
        process.env
          .JWT_ACCESS_SECRET,
      );

    const userData =
      await User.findById(
        decoded._id,
      ).select(
        "-password -otp -otpExpiry",
      );

    if (!userData) {
      return res.status(401).json({
        success: false,
        code: "USER_NOT_FOUND",
        message:
          "User not found",
      });
    }

    if (
      userData.tokenVersion !==
      decoded.tokenVersion
    ) {
      return res.status(401).json({
        success: false,
        code: "LOGGED_OUT",
        message:
          "User logged out",
      });
    }

    req.user = userData;

    next();
  } catch (error) {
    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message:
          "Access token expired",
      });
    }

    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      message:
        error.message,
    });
  }
};

export default authMiddleware;