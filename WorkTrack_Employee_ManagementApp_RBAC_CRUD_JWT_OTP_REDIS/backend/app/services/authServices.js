import User from "../models/User.js";
import hashedPassword from "../utils/hashedPassword.js";
import generateOTP from "../utils/generateOTP.js";
import sendEmail from "../utils/sendMail.js";
import comparePassword from "../utils/comparePassword.js";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshTokenModel.js";

import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/generateToken.js";

const getSafeUser = (user) => {
  const userObject = user.toObject
    ? user.toObject()
    : { ...user };

  delete userObject.password;
  delete userObject.otp;
  delete userObject.otpExpiry;

  return userObject;
};

export const registerService = async (data) => {
  try {
    const existingUser = await User.findOne({
      email: data.email,
    });

    if (existingUser) {
      throw new Error(
        "User already exists",
      );
    }

    const hashedPwd =
      await hashedPassword(
        data.password,
      );

    const otp = generateOTP();

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPwd,

      // Public registration can only create employees.
      role: "employee",

      department:
        data.department,

      designation:
        data.designation,

      otp,
      otpExpiry:
        new Date(
          Date.now() +
            30 *
              60 *
              1000,
        ),
    });

    await sendEmail(
      user.email,
      "OTP for account verification",
      `Your OTP is ${otp}`,
    );

    return getSafeUser(user);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const verifyOTPService = async (
  email,
  otp,
) => {
  try {
    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      throw new Error(
        "User not found",
      );
    }

    if (
      String(user.otp) !==
      String(otp)
    ) {
      throw new Error(
        "Invalid OTP",
      );
    }

    if (
      !user.otpExpiry ||
      user.otpExpiry.getTime() <
        Date.now()
    ) {
      throw new Error(
        "OTP expired",
      );
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return getSafeUser(user);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const resendOTPservice =
  async (email) => {
    try {
      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        throw new Error(
          "User not found",
        );
      }

      if (user.isVerified) {
        throw new Error(
          "User already verified",
        );
      }

      const otp =
        generateOTP();

      user.otp = otp;

      user.otpExpiry =
        new Date(
          Date.now() +
            30 *
              60 *
              1000,
        );

      await user.save();

      await sendEmail(
        user.email,
        "OTP for account verification",
        `Your OTP is ${otp}`,
      );

      return {
        message:
          "OTP sent successfully",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const loginService = async (
  email,
  password,
) => {
  try {
    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      throw new Error(
        "User not found",
      );
    }

    if (!user.isVerified) {
      throw new Error(
        "User not verified",
      );
    }

    const isMatch =
      await comparePassword(
        password,
        user.password,
      );

    if (!isMatch) {
      throw new Error(
        "Invalid password",
      );
    }

    const accessToken =
      generateAccessToken(user);

    const {
      token: refreshToken,
      jti,
    } = generateRefreshToken(
      user,
    );

    const hashedRefreshToken =
      hashToken(
        refreshToken,
      );

    const expiresAt =
      new Date(
        Date.now() +
          7 *
            24 *
            60 *
            60 *
            1000,
      );

    await RefreshToken.create({
      userId: user._id,
      jti,
      tokenHash:
        hashedRefreshToken,
      tokenVersion:
        user.tokenVersion,
      expiresAt,
    });

    user.isloggedIn = true;

    await user.save();

    return {
      user: getSafeUser(user),
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const forgotPasswordService =
  async (email) => {
    try {
      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        throw new Error(
          "User not found",
        );
      }

      const otp =
        generateOTP();

      user.otp = otp;

      user.otpExpiry =
        new Date(
          Date.now() +
            30 *
              60 *
              1000,
        );

      await user.save();

      await sendEmail(
        user.email,
        "OTP for password reset",
        `Your OTP is ${otp}`,
      );

      return getSafeUser(user);
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const resetPasswordService =
  async (
    email,
    otp,
    password,
  ) => {
    try {
      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        throw new Error(
          "User not found",
        );
      }

      if (
        String(user.otp) !==
        String(otp)
      ) {
        throw new Error(
          "Invalid OTP",
        );
      }

      if (
        !user.otpExpiry ||
        user.otpExpiry.getTime() <
          Date.now()
      ) {
        throw new Error(
          "OTP expired",
        );
      }

      const hashedPwd =
        await hashedPassword(
          password,
        );

      user.password =
        hashedPwd;

      user.otp = null;
      user.otpExpiry = null;

      // Invalidate old access tokens.
      user.tokenVersion += 1;

      user.isloggedIn = false;

      // Revoke all active refresh sessions.
      await RefreshToken.updateMany(
        {
          userId: user._id,
          revokedAt: null,
        },
        {
          $set: {
            revokedAt:
              new Date(),
          },
        },
      );

      await user.save();

      return getSafeUser(user);
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const refreshTokenService =
  async (req) => {
    try {
      const refreshToken =
        req.cookies
          .refreshToken;

      if (!refreshToken) {
        return {
          success: false,
          statusCode: 401,
          code:
            "NO_REFRESH_TOKEN",
          message:
            "Refresh token not found",
        };
      }

      const decoded =
        jwt.verify(
          refreshToken,
          process.env
            .JWT_REFRESH_SECRET,
        );

      if (!decoded.jti) {
        return {
          success: false,
          statusCode: 401,
          code:
            "INVALID_REFRESH_TOKEN",
          message:
            "Refresh token JTI missing",
        };
      }

      const storedToken =
        await RefreshToken.findOne({
          jti: decoded.jti,
          userId: decoded._id,
        });

      if (!storedToken) {
        return {
          success: false,
          statusCode: 401,
          code:
            "REFRESH_SESSION_NOT_FOUND",
          message:
            "Refresh token session not found",
        };
      }

      if (storedToken.revokedAt) {
        return {
          success: false,
          statusCode: 401,
          code:
            "REFRESH_TOKEN_REVOKED",
          message:
            "Refresh token has been revoked",
        };
      }

      if (
        storedToken.expiresAt <
        new Date()
      ) {
        return {
          success: false,
          statusCode: 401,
          code:
            "REFRESH_TOKEN_EXPIRED",
          message:
            "Refresh token expired",
        };
      }

      const user =
        await User.findById(
          decoded._id,
        );

      if (!user) {
        return {
          success: false,
          statusCode: 404,
          code:
            "USER_NOT_FOUND",
          message:
            "User not found",
        };
      }

      if (
        storedToken.tokenVersion !==
        user.tokenVersion
      ) {
        return {
          success: false,
          statusCode: 401,
          code:
            "TOKEN_VERSION_MISMATCH",
          message:
            "Refresh token is no longer valid",
        };
      }

      if (
        decoded.tokenVersion !==
        user.tokenVersion
      ) {
        return {
          success: false,
          statusCode: 401,
          code:
            "TOKEN_VERSION_MISMATCH",
          message:
            "Refresh token is no longer valid",
        };
      }

      const incomingTokenHash =
        hashToken(
          refreshToken,
        );

      if (
        incomingTokenHash !==
        storedToken.tokenHash
      ) {
        return {
          success: false,
          statusCode: 401,
          code:
            "INVALID_REFRESH_TOKEN",
          message:
            "Refresh token is invalid",
        };
      }

      const newAccessToken =
        generateAccessToken(
          user,
        );

      const {
        token: newRefreshToken,
        jti: newJti,
      } =
        generateRefreshToken(
          user,
        );

      const newTokenHash =
        hashToken(
          newRefreshToken,
        );

      const newExpiresAt =
        new Date(
          Date.now() +
            7 *
              24 *
              60 *
              60 *
              1000,
        );

      storedToken.revokedAt =
        new Date();

      storedToken.replacedBy =
        newJti;

      await storedToken.save();

      await RefreshToken.create({
        userId: user._id,
        jti: newJti,
        tokenHash:
          newTokenHash,
        tokenVersion:
          user.tokenVersion,
        expiresAt:
          newExpiresAt,
      });

      user.isloggedIn = true;

      await user.save();

      return {
        success: true,
        statusCode: 200,
        message:
          "Token refreshed successfully",
        accessToken:
          newAccessToken,
        refreshToken:
          newRefreshToken,
      };
    } catch (error) {
      if (
        error.name ===
        "TokenExpiredError"
      ) {
        try {
          const refreshToken =
            req.cookies
              .refreshToken;

          const decoded =
            jwt.verify(
              refreshToken,
              process.env
                .JWT_REFRESH_SECRET,
              {
                ignoreExpiration:
                  true,
              },
            );

          const user =
            await User.findById(
              decoded._id,
            );

          if (user) {
            const storedToken =
              await RefreshToken.findOne({
                jti: decoded.jti,
                userId:
                  decoded._id,
              });

            if (
              storedToken &&
              !storedToken.revokedAt
            ) {
              storedToken.revokedAt =
                new Date();

              await storedToken.save();
            }

            const activeSession =
              await RefreshToken.findOne({
                userId: user._id,
                revokedAt: null,
                expiresAt: {
                  $gt: new Date(),
                },
              });

            if (!activeSession) {
              user.isloggedIn =
                false;

              await user.save();
            }
          }
        } catch (cleanupError) {
          // Ignore cleanup errors.
        }

        return {
          success: false,
          statusCode: 401,
          code:
            "REFRESH_TOKEN_EXPIRED",
          message:
            "Refresh token expired",
        };
      }

      if (
        error.name ===
        "JsonWebTokenError"
      ) {
        return {
          success: false,
          statusCode: 401,
          code:
            "INVALID_REFRESH_TOKEN",
          message:
            "Invalid refresh token",
        };
      }

      return {
        success: false,
        statusCode: 500,
        code:
          "REFRESH_TOKEN_ERROR",
        message:
          error.message,
      };
    }
  };

export const logoutService =
  async (req) => {
    try {
      const refreshToken =
        req.cookies
          .refreshToken;

      if (!refreshToken) {
        return {
          success: true,
          statusCode: 200,
          message:
            "User logged out successfully",
        };
      }

      let decoded;

      try {
        decoded =
          jwt.verify(
            refreshToken,
            process.env
              .JWT_REFRESH_SECRET,
          );
      } catch (error) {
        return {
          success: true,
          statusCode: 200,
          message:
            "User logged out successfully",
        };
      }

      if (!decoded.jti) {
        return {
          success: true,
          statusCode: 200,
          message:
            "User logged out successfully",
        };
      }

      const storedToken =
        await RefreshToken.findOne({
          jti: decoded.jti,
          userId: decoded._id,
        });

      if (!storedToken) {
        return {
          success: true,
          statusCode: 200,
          message:
            "User logged out successfully",
        };
      }

      if (!storedToken.revokedAt) {
        storedToken.revokedAt =
          new Date();

        await storedToken.save();
      }

      const user =
        await User.findById(
          decoded._id,
        );

      if (user) {
        user.isloggedIn =
          false;

        await user.save();
      }

      return {
        success: true,
        statusCode: 200,
        message:
          "User logged out successfully",
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        code:
          "LOGOUT_ERROR",
        message:
          error.message,
      };
    }
  };

export const getProfileService =
  async (user) => {
    try {
      return {
        success: true,
        statusCode: 200,
        message:
          "Profile fetched successfully",
        user,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };