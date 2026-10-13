import { Worker } from "bullmq";

import redisConnection from "../config/redis.js";

import { markAutomaticAbsenceService } from "../services/attendanceServices.js";

import { finishExpiredExtraWorkSessionsService } from "../services/extraWorkServices.js";

const attendanceWorker = new Worker(
  "attendance-queue",
  async (job) => {
    if (job.name === "mark-automatic-absence") {
      await markAutomaticAbsenceService();
      await finishExpiredExtraWorkSessionsService();
    }
  },
  {
    connection: redisConnection,
  },
);

attendanceWorker.on("completed", (job) => {
  console.log(`Attendance job completed: ${job.name}`);
});

attendanceWorker.on("failed", (job, error) => {
  console.log(`Attendance job failed: ${job?.name}`, error.message);
});

export default attendanceWorker;
