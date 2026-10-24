import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./app/config/db.js";

import errorMiddleware from "./app/middlewares/errorMiddleware.js";

import authRoutes from "./app/routes/authRoutes.js";
import superAdminRoutes from "./app/routes/superAdminRoutes.js";
import customerRoutes from "./app/routes/customerRoutes.js";
import busRoutes from "./app/routes/busRoutes.js";
import bookingStaffRoutes from "./app/routes/bookingStaffRoutes.js";
import bookingRoutes from "./app/routes/bookingRoutes.js";
import routeRoutes from "./app/routes/routeRoutes.js";
import tripRoutes from "./app/routes/tripRoutes.js";
import driverRoutes from "./app/routes/driverRoutes.js";
import seatLayoutRoutes from "./app/routes/seatLayoutRoutes.js";
import paymentRoutes from "./app/routes/paymentRoutes.js";
import ticketGenerationRoutes from "./app/routes/ticketGenerationRoutes.js";

const app = express();

const PORT = process.env.PORT || 8000;

// CLIENT_URL may contain one frontend URL or multiple comma-separated URLs.
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

// Global middleware
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

// CORS
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header (e.g. server-to-server/health checks).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);

// Authentication
app.use("/api/auth", authRoutes);

// Super Admin
app.use("/api/super_admin", superAdminRoutes);

// Customer
app.use("/api/customer", customerRoutes);

// Bus
app.use("/api/bus", busRoutes);

// Booking Staff
app.use("/api/booking_staff", bookingStaffRoutes);

// Booking
app.use("/api/booking", bookingRoutes);

// Routes
app.use("/api/routes", routeRoutes);

// Trips
app.use("/api/trip", tripRoutes);

// Driver
app.use("/api/driver", driverRoutes);

// Seat Layout
app.use("/api/seat-layout", seatLayoutRoutes);

// Payment
app.use("/api/payment", paymentRoutes);

// Ticket Generation
app.use("/api/ticket", ticketGenerationRoutes);

// Health check
app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "App is running....",
  });
});

// Error middleware should remain after routes.
app.use(errorMiddleware);

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
