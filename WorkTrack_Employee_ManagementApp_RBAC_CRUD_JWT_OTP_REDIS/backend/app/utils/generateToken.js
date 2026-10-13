import jwt from "jsonwebtoken";
import crypto from "crypto";

// Generate access token
export const generateAccessToken = (user) => {
  try {
    // payload
    const token = jwt.sign(
      {
        // payload
        _id: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      // secret
      process.env.JWT_ACCESS_SECRET,
      // options
      {
        expiresIn: "5s",
      },
    );

    return token;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Generate refresh token
export const generateRefreshToken = (user) => {
  try {
    // Generate Unique JTI for refresh token
    const jti = crypto.randomUUID();
    // payload
    const token = jwt.sign(
      {
        // payload
        _id: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      // secret
      process.env.JWT_REFRESH_SECRET,
      // options
      {
        expiresIn: "7d",
        jwtid: jti,
      },
    );

    return {
      token,
      jti,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// generate hash token
export const hashToken = (token)=>{
  try {
    const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
    return tokenHash;
  } catch (error) {
    throw new Error(error.message);
  }
}
