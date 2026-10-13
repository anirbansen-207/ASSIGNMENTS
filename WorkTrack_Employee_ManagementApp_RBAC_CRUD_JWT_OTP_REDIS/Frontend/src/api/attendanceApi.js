
import axiosInstance from "./axios";

// Employee attendance actions.
export const checkInApi = async () => {
  const response = await axiosInstance.post("/api/attendance/check-in");
  return response.data.data;
};

export const checkOutApi = async () => {
  const response = await axiosInstance.post("/api/attendance/check-out");
  return response.data.data;
};

export const startBreakApi = async () => {
  const response = await axiosInstance.post("/api/attendance/break/start");
  return response.data.data;
};

export const endBreakApi = async () => {
  const response = await axiosInstance.post("/api/attendance/break/end");
  return response.data.data;
};

export const getMyAttendanceApi = async () => {
  const response = await axiosInstance.get("/api/attendance/my-attendance");
  return response.data.data;
};

// Manager attendance views.
export const getTeamAttendanceApi = async (teamId) => {
  const response = await axiosInstance.get(
    `/api/attendance/team-attendance/${teamId}`,
  );
  return response.data.data;
};

export const getTeamAttendanceByDateApi = async (teamId, date) => {
  const response = await axiosInstance.get(
    `/api/attendance/team-attendance/${teamId}/by-date`,
    { params: { date } },
  );
  return response.data.data;
};

// Admin attendance views.
export const getAllAttendanceApi = async () => {
  const response = await axiosInstance.get("/api/attendance/all-attendance");
  return response.data.data;
};

export const getAllAttendanceByDateApi = async (date) => {
  const response = await axiosInstance.get(
    "/api/attendance/all-attendance/by-date",
    { params: { date } },
  );
  return response.data.data;
};

export const getAttendanceByDateAndTeamApi = async (date, teamId) => {
  const response = await axiosInstance.get(
    "/api/attendance/all-attendance/by-date-and-team",
    { params: { date, teamId } },
  );
  return response.data.data;
};

export const correctAttendanceApi = async (attendanceId, data) => {
  const response = await axiosInstance.patch(
    `/api/attendance/correct-attendance/${attendanceId}`,
    data,
  );
  return response.data.data;
};

// Employee extra-work request and history.
export const requestExtraWorkApi = async (reason) => {
  const response = await axiosInstance.post(
    "/api/extra-work/request",
    { reason },
  );
  return response.data.data;
};

export const getMyExtraWorkRequestsApi = async () => {
  const response = await axiosInstance.get("/api/extra-work/my-requests");
  return response.data.data;
};

export const getExtraTimeSummaryApi = async () => {
  const response = await axiosInstance.get("/api/extra-work/my-summary");
  return response.data.data;
};

export const checkOutExtraWorkApi = async (requestId) => {
  const response = await axiosInstance.post(
    `/api/extra-work/checkout/${requestId}`,
  );
  return response.data.data;
};

// Manager extra-work approval.
export const getPendingExtraWorkRequestsApi = async () => {
  const response = await axiosInstance.get("/api/extra-work/pending");
  return response.data.data;
};

export const decideExtraWorkRequestApi = async (
  requestId,
  decision,
  data,
) => {
  const response = await axiosInstance.patch(
    `/api/extra-work/${requestId}/${decision}`,
    data,
  );
  return response.data.data;
};


// Admin-only organization-wide extra-work audit.
export const getAllExtraWorkRecordsApi = async (filters = {}) => {
  const response = await axiosInstance.get(
    "/api/extra-work/all-records",
    { params: filters },
  );

  return response.data.data;
};


 // Manager-created extra-duty assignments.
export const createExtraWorkAssignmentApi = async (assignmentData) => {
  const response = await axiosInstance.post(
    "/api/extra-work/assign",
    assignmentData,
  );

  return response.data.data;
};

export const getMyExtraWorkAssignmentsApi = async () => {
  const response = await axiosInstance.get(
    "/api/extra-work/my-assignments",
  );

  return response.data.data;
};

export const acceptExtraWorkAssignmentApi = async (assignmentId) => {
  const response = await axiosInstance.post(
    `/api/extra-work/assignments/${assignmentId}/accept`,
  );

  return response.data.data;
};

export const rejectExtraWorkAssignmentApi = async (assignmentId) => {
  const response = await axiosInstance.post(
    `/api/extra-work/assignments/${assignmentId}/reject`,
  );

  return response.data.data;
};


 // Manager fetches extra-duty assignments created by them.
export const getManagerExtraWorkAssignmentsApi = async () => {
  const response = await axiosInstance.get(
    "/api/extra-work/manager-assignments",
  );

  return response.data.data;
};

// Manager deletes an unstarted extra-task assignment.
export const deleteExtraWorkAssignmentApi = async (assignmentId) => {
  const response = await axiosInstance.delete(
    `/api/extra-work/assignments/${assignmentId}`,
  );

  return response.data.data;
};
