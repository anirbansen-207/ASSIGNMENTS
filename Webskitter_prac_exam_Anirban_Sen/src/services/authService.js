import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  createAccessToken,
  createRefreshToken
} from "../utils/createToken.js";

export const registerUser = async (data) => {
  const existingUser = await User.findOne({
    email: data.email
  });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: "user"
  });
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.isBlocked) {
    throw new Error("Your account is blocked");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  return {
    user,
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user)
  };
};

export const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  const user = await User.findById(decoded.id);

  if (!user || user.isBlocked) {
    throw new Error("User is unavailable");
  }

  if (decoded.tokenVersion !== user.tokenVersion) {
    throw new Error("Refresh token has been revoked");
  }

  // Increment the version to invalidate the old refresh and access tokens.
  user.tokenVersion += 1;
  await user.save();

  return {
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user)
  };
};

export const logoutUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { tokenVersion: 1 } },
    { new: true }
  );

  if (!user) {
    throw new Error("User not found");
  }
};