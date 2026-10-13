import { attendanceQueue } from "./attendanceQueue.js";

export const startAttendanceScheduler =
  async () => {
    await attendanceQueue.upsertJobScheduler(
      "attendance-absence-check",
      {
        every: 60 * 1000,
      },
      {
        name: "mark-automatic-absence",
        data: {},
        opts: {
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      },
    );

    console.log(
      "Attendance scheduler started",
    );
  };