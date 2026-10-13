import { Queue } from "bullmq";
import redisConnection from "../config/redis.js";

export const attendanceQueue = new Queue(
  "attendance-queue",
  {
    connection: redisConnection,
  },
);