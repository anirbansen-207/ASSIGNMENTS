
import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AccessTime,
  CalendarMonth,
  Coffee,
  Login,
  Logout,
  Send,
  WorkHistory,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  checkInApi,
  checkOutApi,
  startBreakApi,
  endBreakApi,
  getMyAttendanceApi,
  requestExtraWorkApi,
  getMyExtraWorkRequestsApi,
  getExtraTimeSummaryApi,
  checkOutExtraWorkApi,
} from "../../api/attendanceApi";

const TIME_ZONE = "Asia/Kolkata";

const getDateKey = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value: partValue }) => [
      type,
      partValue,
    ]),
  );

  return `${values.year}-${values.month}-${values.day}`;
};

const formatDate = (value) => {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return "—";
  }

  return new Date(value).toLocaleString("en-IN", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (value) => {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return "—";
  }

  return new Date(value).toLocaleTimeString("en-IN", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMinutes = (minutes) => {
  const total = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(total / 60);
  const remaining = total % 60;

  if (hours && remaining) {
    return `${hours}h ${remaining}m`;
  }

  if (hours) {
    return `${hours}h`;
  }

  return `${remaining} min`;
};

const formatStatus = (status) =>
  (status || "—").replaceAll("_", " ");

const getStatusColor = (status) => {
  switch (status) {
    case "PRESENT":
    case "APPROVED":
    case "COMPLETED":
      return "success";

    case "LATE":
    case "PENDING":
    case "HALF_DAY":
      return "warning";

    case "ABSENT":
    case "REJECTED":
      return "error";

    case "ON_LEAVE":
      return "info";

    default:
      return "default";
  }
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

function DetailItem({ label, value, icon }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        height: "100%",
        p: 1.75,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        backgroundColor: "background.paper",
        boxSizing: "border-box",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mb: 1 }}
      >
        {icon && (
          <Box
            sx={{
              display: "flex",
              color: "text.secondary",
              "& svg": { fontSize: 19 },
            }}
          >
            {icon}
          </Box>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          sx={{ letterSpacing: 0.15 }}
        >
          {label}
        </Typography>
      </Stack>

      <Typography
        variant="body1"
        fontWeight={600}
        sx={{
          overflowWrap: "anywhere",
          lineHeight: 1.6,
          color: "text.primary",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

function SectionHeading({ icon, title, subtitle, action }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      spacing={1.5}
      sx={{ mb: 2.5 }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        sx={{ minWidth: 0 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 42,
            height: 42,
            flexShrink: 0,
            borderRadius: 2,
            color: "primary.main",
            backgroundColor: "action.hover",
            "& svg": { fontSize: 23 },
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ letterSpacing: 0.1 }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      {action}
    </Stack>
  );
}

function MyAttendance() {
  const queryClient = useQueryClient();

  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [extraWorkReason, setExtraWorkReason] = useState("");
  const [actionError, setActionError] = useState("");

  const attendanceQuery = useQuery({
    queryKey: ["my-attendance"],
    queryFn: getMyAttendanceApi,
    refetchInterval: 30000,
  });

  const extraRequestsQuery = useQuery({
    queryKey: ["my-extra-work-requests"],
    queryFn: getMyExtraWorkRequestsApi,
    refetchInterval: 30000,
  });

  const extraSummaryQuery = useQuery({
    queryKey: ["extra-time-summary"],
    queryFn: getExtraTimeSummaryApi,
    refetchInterval: 30000,
  });

  const attendance = Array.isArray(attendanceQuery.data)
    ? attendanceQuery.data
    : [];

  const extraRequests = Array.isArray(extraRequestsQuery.data)
    ? extraRequestsQuery.data
    : [];

  const extraTimeSummary = extraSummaryQuery.data || {};

  const refreshAttendanceData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["my-attendance"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["my-extra-work-requests"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["extra-time-summary"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["my-notifications"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["unread-notifications"],
      }),
    ]);
  };

  const checkInMutation = useMutation({
    mutationFn: checkInApi,
    onSuccess: refreshAttendanceData,
  });

  const checkOutMutation = useMutation({
    mutationFn: checkOutApi,
    onSuccess: refreshAttendanceData,
  });

  const startBreakMutation = useMutation({
    mutationFn: startBreakApi,
    onSuccess: refreshAttendanceData,
  });

  const endBreakMutation = useMutation({
    mutationFn: endBreakApi,
    onSuccess: refreshAttendanceData,
  });

  const requestExtraWorkMutation = useMutation({
    mutationFn: requestExtraWorkApi,
    onSuccess: async () => {
      setRequestDialogOpen(false);
      setExtraWorkReason("");
      setActionError("");
      await refreshAttendanceData();
    },
  });

  const checkOutExtraWorkMutation = useMutation({
    mutationFn: checkOutExtraWorkApi,
    onSuccess: refreshAttendanceData,
  });

  const todayAttendance = useMemo(() => {
    const todayKey = getDateKey(new Date());

    return (
      attendance.find(
        (record) =>
          getDateKey(record?.attendanceDate) === todayKey,
      ) || null
    );
  }, [attendance]);

  const activeExtraSession = extraRequests.find(
    (request) =>
      request.status === "APPROVED" && !request.actualEndAt,
  );

  const pendingExtraRequest = extraRequests.find(
    (request) => request.status === "PENDING",
  );

  const breakIsActive = Boolean(
    todayAttendance?.breakUsed &&
      todayAttendance?.breakStartedAt &&
      !todayAttendance?.breakEndedAt,
  );

  const anyMutationPending = [
    checkInMutation,
    checkOutMutation,
    startBreakMutation,
    endBreakMutation,
    requestExtraWorkMutation,
    checkOutExtraWorkMutation,
  ].some((mutation) => mutation.isPending);

  const handleCheckIn = async () => {
    setActionError("");

    try {
      await checkInMutation.mutateAsync();
    } catch (error) {
      const message = getErrorMessage(error, "Check-in failed.");

      if (
        /outside your scheduled shift|scheduled shift has ended|outside.*shift/i.test(
          message,
        )
      ) {
        checkInMutation.reset();
        setRequestDialogOpen(true);
      } else {
        setActionError(message);
      }
    }
  };

  const submitExtraWorkRequest = () => {
    const reason = extraWorkReason.trim();

    if (reason.length < 3 || reason.length > 500) {
      setActionError(
        "Please enter a reason between 3 and 500 characters.",
      );
      return;
    }

    setActionError("");

    requestExtraWorkMutation.mutate(reason, {
      onError: (error) => {
        setActionError(
          getErrorMessage(
            error,
            "Could not send the extra-work request.",
          ),
        );
      },
    });
  };

  const closeRequestDialog = () => {
    if (requestExtraWorkMutation.isPending) return;

    setRequestDialogOpen(false);
    setActionError("");
  };

  const mutationError =
    checkInMutation.error ||
    checkOutMutation.error ||
    startBreakMutation.error ||
    endBreakMutation.error ||
    requestExtraWorkMutation.error ||
    checkOutExtraWorkMutation.error;

  const errorMessage =
    actionError ||
    mutationError?.response?.data?.message ||
    mutationError?.message ||
    "";

  if (attendanceQuery.isLoading) {
    return (
      <Box
        sx={{
          minHeight: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={28} />

        <Typography color="text.secondary">
          Loading attendance...
        </Typography>
      </Box>
    );
  }

  if (attendanceQuery.isError) {
    return (
      <Alert severity="error">
        {getErrorMessage(
          attendanceQuery.error,
          "Failed to load attendance.",
        )}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        pb: 3,
      }}
    >
      <Box sx={{ mb: 3.5 }}>
        <Typography
          variant="h4"
          fontWeight={750}
          sx={{
            fontSize: { xs: "1.7rem", sm: "2.1rem" },
            color: "text.primary",
          }}
        >
          My Attendance
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          Manage your scheduled attendance, breaks, and work outside
          your shift.
        </Typography>
      </Box>

      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => {
            setActionError("");
            checkInMutation.reset();
            checkOutMutation.reset();
            startBreakMutation.reset();
            endBreakMutation.reset();
            requestExtraWorkMutation.reset();
            checkOutExtraWorkMutation.reset();
          }}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Today's attendance */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", lg: "center" }}
            spacing={2.5}
          >
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 0.75 }}
              >
                <CalendarMonth color="primary" />

                <Typography variant="h6" fontWeight={700}>
                  Today's Attendance
                </Typography>
              </Stack>

              <Typography color="text.secondary">
                {todayAttendance
                  ? `Current status: ${formatStatus(
                      todayAttendance.status,
                    )}`
                  : "You have not checked in today."}
              </Typography>

              {todayAttendance?.checkInAt && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.75 }}
                >
                  Checked in at {formatTime(todayAttendance.checkInAt)}
                </Typography>
              )}
            </Box>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              sx={{
                "& .MuiButton-root": {
                  textTransform: "none",
                  fontWeight: 650,
                  borderRadius: 2,
                },
              }}
            >
              <Button
                variant="contained"
                startIcon={<Login />}
                disabled={
                  Boolean(todayAttendance?.checkInAt) ||
                  Boolean(pendingExtraRequest) ||
                  Boolean(activeExtraSession) ||
                  anyMutationPending
                }
                onClick={handleCheckIn}
              >
                {checkInMutation.isPending
                  ? "Checking In..."
                  : "Check In"}
              </Button>

              <Button
                variant="outlined"
                startIcon={<Coffee />}
                disabled={
                  !todayAttendance?.checkInAt ||
                  Boolean(todayAttendance?.checkOutAt) ||
                  Boolean(todayAttendance?.breakUsed) ||
                  Boolean(activeExtraSession) ||
                  anyMutationPending
                }
                onClick={() => {
                  setActionError("");
                  startBreakMutation.mutate();
                }}
              >
                {startBreakMutation.isPending
                  ? "Starting..."
                  : "Start Break"}
              </Button>

              <Button
                variant="outlined"
                color="success"
                startIcon={<Coffee />}
                disabled={!breakIsActive || anyMutationPending}
                onClick={() => {
                  setActionError("");
                  endBreakMutation.mutate();
                }}
              >
                {endBreakMutation.isPending
                  ? "Ending..."
                  : "End Break"}
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<Logout />}
                disabled={
                  !todayAttendance?.checkInAt ||
                  Boolean(todayAttendance?.checkOutAt) ||
                  breakIsActive ||
                  anyMutationPending
                }
                onClick={() => {
                  setActionError("");
                  checkOutMutation.mutate();
                }}
              >
                {checkOutMutation.isPending
                  ? "Checking Out..."
                  : "Check Out"}
              </Button>
            </Stack>
          </Stack>

          {todayAttendance && (
            <>
              <Divider sx={{ my: 2.5 }} />

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DetailItem
                    icon={<Login />}
                    label="Check-in Time"
                    value={formatDateTime(todayAttendance.checkInAt)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DetailItem
                    icon={<Logout />}
                    label="Check-out Time"
                    value={formatDateTime(todayAttendance.checkOutAt)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DetailItem
                    icon={<AccessTime />}
                    label="Working Time"
                    value={formatMinutes(
                      todayAttendance.totalWorkingMinutes,
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DetailItem
                    icon={<Coffee />}
                    label="Break Duration"
                    value={
                      todayAttendance.breakUsed
                        ? formatMinutes(
                            todayAttendance.breakDurationMinutes,
                          )
                        : "Not used"
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DetailItem
                    icon={<WorkHistory />}
                    label="Actual Extra Time"
                    value={formatMinutes(
                      extraTimeSummary[
                        getDateKey(todayAttendance.attendanceDate)
                      ] || 0,
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DetailItem
                    icon={<AccessTime />}
                    label="Attendance Status"
                    value={formatStatus(todayAttendance.status)}
                  />
                </Grid>
              </Grid>

              {breakIsActive && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Your break is active. You can return early using
                  End Break. The backend enforces the maximum break
                  duration.
                </Alert>
              )}

              {todayAttendance.requiresReview && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This attendance record requires review.{" "}
                  {todayAttendance.reviewReason || ""}
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Active extra-work session */}
      {activeExtraSession && (
        <Card
          elevation={0}
          sx={{
            mb: 3,
            border: "1px solid",
            borderColor: "success.light",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: 4,
              backgroundColor: "success.main",
            }}
          />

          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                spacing={1.5}
              >
                <SectionHeading
                  icon={<WorkHistory />}
                  title="Approved Extra-Work Session"
                  subtitle="Your approved session is currently active."
                />

                <Chip
                  label="In Progress"
                  color="success"
                  size="small"
                  sx={{
                    fontWeight: 700,
                    alignSelf: { xs: "flex-start", sm: "center" },
                  }}
                />
              </Stack>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DetailItem
                    icon={<Login />}
                    label="Started At"
                    value={formatDateTime(
                      activeExtraSession.actualStartAt,
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DetailItem
                    icon={<AccessTime />}
                    label="Scheduled End"
                    value={formatDateTime(
                      activeExtraSession.approvedEndAt,
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DetailItem
                    icon={<WorkHistory />}
                    label="Approved Duration"
                    value={formatMinutes(
                      activeExtraSession.approvedDurationMinutes,
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DetailItem
                    icon={<CalendarMonth />}
                    label="Requested At"
                    value={formatDateTime(
                      activeExtraSession.requestedAt,
                    )}
                  />
                </Grid>
              </Grid>

              <Divider />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                spacing={1.5}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    maxWidth: 650,
                    lineHeight: 1.7,
                  }}
                >
                  You may finish early. Otherwise, the backend
                  automatically ends the session at its approved
                  deadline.
                </Typography>

                <Button
                  variant="contained"
                  color="success"
                  size="medium"
                  startIcon={<Logout />}
                  disabled={anyMutationPending}
                  onClick={() => {
                    setActionError("");
                    checkOutExtraWorkMutation.mutate(
                      activeExtraSession._id,
                    );
                  }}
                  sx={{
                    alignSelf: { xs: "stretch", sm: "center" },
                    flexShrink: 0,
                    minWidth: 0,
                    px: 2,
                    py: 1,
                    whiteSpace: "nowrap",
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 2,
                    boxShadow: "none",
                  }}
                >
                  {checkOutExtraWorkMutation.isPending
                    ? "Finishing..."
                    : "Finish Extra Work"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Extra-work requests */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <SectionHeading
            icon={<WorkHistory />}
            title="Extra-Work Requests"
            subtitle="Review your requests, manager decisions, and actual work time."
          />

          {extraRequestsQuery.isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 4,
              }}
            >
              <CircularProgress size={26} />
            </Box>
          ) : extraRequestsQuery.isError ? (
            <Alert severity="warning">
              {getErrorMessage(
                extraRequestsQuery.error,
                "Extra-work request status could not be loaded.",
              )}
            </Alert>
          ) : extraRequests.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                py: 4,
                px: 2,
                textAlign: "center",
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 2,
                backgroundColor: "action.hover",
              }}
            >
              <WorkHistory
                sx={{
                  fontSize: 36,
                  color: "text.secondary",
                  mb: 1,
                }}
              />

              <Typography fontWeight={700}>
                No extra-work requests yet
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Requests you submit outside your shift will appear here.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {extraRequests.map((request) => (
                <Paper
                  key={request._id}
                  elevation={0}
                  sx={{
                    p: { xs: 1.75, sm: 2.25 },
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2.5,
                    backgroundColor: "background.paper",
                  }}
                >
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{ overflowWrap: "anywhere" }}
                        >
                          {request.teamId?.name || "Extra Work"}
                        </Typography>

                        <Typography
                          variant="caption"
                          fontWeight={500}
                          color="text.secondary"
                        >
                          Requested on{" "}
                          {formatDateTime(request.requestedAt)}
                        </Typography>
                      </Box>

                      <Chip
                        size="small"
                        label={formatStatus(request.status)}
                        color={getStatusColor(request.status)}
                        sx={{
                          fontWeight: 700,
                          alignSelf: { xs: "flex-start", sm: "center" },
                        }}
                      />
                    </Stack>

                    <Box
                      sx={{
                        p: 1.75,
                        borderRadius: 2,
                        backgroundColor: "action.hover",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={700}
                        sx={{
                          letterSpacing: 0.2,
                          mb: 0.75,
                        }}
                      >
                        Employee Reason
                      </Typography>

                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{ lineHeight: 1.7 }}
                      >
                        {request.employeeReason || "No reason provided."}
                      </Typography>
                    </Box>

                    {request.managerReason && (
                      <Box
                        sx={{
                          p: 1.75,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={700}
                          sx={{
                            letterSpacing: 0.2,
                            mb: 0.75,
                          }}
                        >
                          Manager Decision Note
                        </Typography>

                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ lineHeight: 1.7 }}
                        >
                          {request.managerReason}
                        </Typography>
                      </Box>
                    )}

                    <Grid container spacing={1.5}>
                      {request.approvedDurationMinutes != null && (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <DetailItem
                            label="Approved Duration"
                            value={formatMinutes(
                              request.approvedDurationMinutes,
                            )}
                          />
                        </Grid>
                      )}

                      {request.actualStartAt && (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <DetailItem
                            label="Started At"
                            value={formatDateTime(
                              request.actualStartAt,
                            )}
                          />
                        </Grid>
                      )}

                      {request.approvedEndAt && (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <DetailItem
                            label="Scheduled End"
                            value={formatDateTime(
                              request.approvedEndAt,
                            )}
                          />
                        </Grid>
                      )}

                      {request.actualEndAt && (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <DetailItem
                            label="Actual End"
                            value={formatDateTime(
                              request.actualEndAt,
                            )}
                          />
                        </Grid>
                      )}

                      {request.status === "COMPLETED" && (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <DetailItem
                            icon={<AccessTime />}
                            label="Actual Extra Time"
                            value={formatMinutes(
                              request.actualExtraMinutes,
                            )}
                          />
                        </Grid>
                      )}
                    </Grid>

                    {request.status === "PENDING" && (
                      <Alert severity="info">
                        Your request is waiting for manager approval.
                        The session starts only after approval.
                      </Alert>
                    )}

                    {request.status === "APPROVED" &&
                      !request.actualEndAt && (
                        <Alert severity="success">
                          Your request is approved. Your extra-work
                          session is active.
                        </Alert>
                      )}

                    {request.status === "COMPLETED" &&
                      request.autoCheckedOut && (
                        <Alert severity="success">
                          This session was automatically completed
                          at its approved deadline.
                        </Alert>
                      )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Attendance history */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <SectionHeading
            icon={<AccessTime />}
            title="Attendance History"
            subtitle={`${attendance.length} attendance ${
              attendance.length === 1 ? "record" : "records"
            }`}
          />

          {extraSummaryQuery.isError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Extra-time totals are temporarily unavailable.
            </Alert>
          )}

          {attendance.length === 0 ? (
            <Alert severity="info">
              No attendance records found.
            </Alert>
          ) : (
            <TableContainer
              sx={{
                width: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Table
                size="medium"
                sx={{
                  minWidth: 1050,
                  "& .MuiTableCell-root": {
                    px: 2,
                    py: 1.75,
                    borderColor: "divider",
                  },
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "action.hover",
                      "& .MuiTableCell-head": {
                        fontWeight: 700,
                        color: "text.secondary",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <TableCell>Date</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Working Time</TableCell>
                    <TableCell>Break</TableCell>
                    <TableCell>Extra Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Correction</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {attendance.map((record, index) => (
                    <TableRow
                      key={
                        record._id ||
                        `${record.attendanceDate || "attendance"}-${index}`
                      }
                      hover
                      sx={{
                        "&:last-child td": { borderBottom: 0 },
                      }}
                    >
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography variant="body2" fontWeight={600}>
                          {formatDate(record.attendanceDate)}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDateTime(record.checkInAt)}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDateTime(record.checkOutAt)}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatMinutes(record.totalWorkingMinutes)}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {record.breakUsed
                          ? formatMinutes(record.breakDurationMinutes)
                          : "Not used"}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="success.dark"
                        >
                          {formatMinutes(
                            extraTimeSummary[
                              getDateKey(record.attendanceDate)
                            ] || 0,
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={formatStatus(record.status)}
                          color={getStatusColor(record.status)}
                          sx={{
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ minWidth: 150 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ overflowWrap: "anywhere" }}
                        >
                          {record.correctionReason || "—"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Out-of-shift extra-work request dialog */}
      <Dialog
        open={requestDialogOpen}
        onClose={closeRequestDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Request Manager Approval
        </DialogTitle>

        <DialogContent>
          <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
            You are outside your scheduled shift. Please submit a
            reason and wait for your manager's approval. If approved,
            your extra-work session starts at the approval time.
          </Alert>

          <TextField
            label="Reason for working outside your shift"
            value={extraWorkReason}
            onChange={(event) => {
              setExtraWorkReason(event.target.value);
              setActionError("");
            }}
            multiline
            minRows={3}
            inputProps={{ maxLength: 500 }}
            required
            fullWidth
            helperText="Enter between 3 and 500 characters."
          />

          {actionError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {actionError}
            </Alert>
          )}

          {requestExtraWorkMutation.isError && !actionError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {getErrorMessage(
                requestExtraWorkMutation.error,
                "Could not send the extra-work request.",
              )}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={closeRequestDialog}
            disabled={requestExtraWorkMutation.isPending}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={submitExtraWorkRequest}
            disabled={
              requestExtraWorkMutation.isPending ||
              extraWorkReason.trim().length < 3 ||
              extraWorkReason.trim().length > 500
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {requestExtraWorkMutation.isPending
              ? "Sending..."
              : "Send Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyAttendance;
