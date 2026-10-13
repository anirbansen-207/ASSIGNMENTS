import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    // The user who owns this refresh-token session
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Unique ID of this particular refresh JWT
    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // SHA-256 hash of the actual refresh token
    // We never store the raw refresh token in MongoDB.
    tokenHash: {
      type: String,
      required: true,
    },

    // Same tokenVersion concept already present in your User model.
    // Useful for invalidating all sessions after a security event.
    tokenVersion: {
      type: Number,
      required: true,
    },

    // When this refresh session expires
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    // null = active
    // date = revoked
    revokedAt: {
      type: Date,
      default: null,
    },

    // If this token was rotated, store the jti
    // of the new refresh token.
    replacedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "refresh_tokens",
  },
);

const RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema,
);

export default RefreshToken;