
import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";

import routes from "./app/routes/index.js";
import connectDB from "./app/config/db.js";
import { initializeSocket } from "./app/config/socket.js";
import { startAttendanceScheduler } from "./app/jobs/startAttendanceScheduler.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.get("/health", (req, res) => {
  res.send("HR Management App is running...");
});

const server = http.createServer(app);

initializeSocket(server);

const PORT = Number(process.env.PORT) || 6000;

const listen = (port) => {
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.warn(
        `Port ${port} is busy, trying port ${port + 1}...`,
      );

      listen(port + 1);
      return;
    }

    console.error("HTTP server error:", error);
    process.exitCode = 1;
  });

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

const bootstrap = async () => {
  try {
    await connectDB();

    await import("./app/jobs/attendanceWorker.js");

    try {
      await startAttendanceScheduler();
    } catch (error) {
      console.error(
        "Attendance scheduler failed to start:",
        error.message,
      );
    }

    listen(PORT);
  } catch (error) {
    console.error(
      "Application startup failed:",
      error.message,
    );

    process.exit(1);
  }
};

bootstrap();
