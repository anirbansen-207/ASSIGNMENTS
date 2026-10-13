
import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  DoneAll,
  NotificationsActive,
  PlayArrow,
} from "@mui/icons-material";
import useAuth from "../../hooks/useAuth";
import {
  getMyNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from "../../api/notificationApi";
import {
  getMyExtraWorkAssignmentsApi,
  acceptExtraWorkAssignmentApi,
  rejectExtraWorkAssignmentApi,
  getPendingExtraWorkRequestsApi,
  decideExtraWorkRequestApi,
} from "../../api/attendanceApi";

function Notifications() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isManager = user?.role === "manager";
  const isEmployee = user?.role === "employee";

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentActionError, setAssignmentActionError] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvedHours, setApprovedHours] = useState("1");
  const [managerReason, setManagerReason] = useState("");
  const [formError, setFormError] = useState("");

  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["my-notifications"],
    queryFn: getMyNotificationsApi,
    refetchInterval: 30000,
  });

  // Employee assignments are displayed here, but created from Task Management.
  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    isError: assignmentsError,
    error: assignmentsErrorDetails,
  } = useQuery({
    queryKey: ["my-extra-work-assignments"],
    queryFn: getMyExtraWorkAssignmentsApi,
    enabled: isEmployee,
    refetchInterval: 30000,
  });

  // Managers can still review extra-work requests submitted by employees.
  const {
    data: pendingRequests = [],
    isLoading: requestsLoading,
    isError: requestsError,
    error: requestsErrorDetails,
  } = useQuery({
    queryKey: ["pending-extra-work-requests"],
    queryFn: getPendingExtraWorkRequestsApi,
    enabled: isManager,
    refetchInterval: 30000,
  });

  const refreshNotifications = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["my-notifications"] }),
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] }),
      queryClient.invalidateQueries({
        queryKey: ["pending-extra-work-requests"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["my-extra-work-requests"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["my-extra-work-assignments"],
      }),
      queryClient.invalidateQueries({ queryKey: ["extra-time-summary"] }),
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] }),
    ]);
  };

  const markReadMutation = useMutation({
    mutationFn: markNotificationReadApi,
    onSuccess: refreshNotifications,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: refreshNotifications,
  });

  const acceptAssignmentMutation = useMutation({
    mutationFn: acceptExtraWorkAssignmentApi,
    onSuccess: async () => {
      setSelectedAssignment(null);
      setAssignmentActionError("");
      await refreshNotifications();
    },
    onError: (mutationError) => {
      setAssignmentActionError(
        mutationError?.response?.data?.message ||
          mutationError?.message ||
          "Could not accept the assignment.",
      );
    },
  });

  const rejectAssignmentMutation = useMutation({
    mutationFn: rejectExtraWorkAssignmentApi,
    onSuccess: async () => {
      setSelectedAssignment(null);
      setAssignmentActionError("");
      await refreshNotifications();
    },
    onError: (mutationError) => {
      setAssignmentActionError(
        mutationError?.response?.data?.message ||
          mutationError?.message ||
          "Could not decline the assignment.",
      );
    },
  });

  const decisionMutation = useMutation({
    mutationFn: ({ requestId, decision, data }) =>
      decideExtraWorkRequestApi(requestId, decision, data),
    onSuccess: async () => {
      setSelectedRequest(null);
      setManagerReason("");
      setApprovedHours("1");
      setFormError("");
      await refreshNotifications();
    },
    onError: (mutationError) => {
      setFormError(
        mutationError?.response?.data?.message ||
          mutationError?.message ||
          "Could not process the request.",
      );
    },
  });

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const formatType = (type) =>
    (type || "Notification")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase());

  const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
  };

  const findPendingRequest = (notification) =>
    pendingRequests.find(
      (request) => String(request._id) === String(notification.relatedId),
    );

  const findAssignment = (notification) =>
    assignments.find(
      (assignment) =>
        String(assignment._id) === String(notification.relatedId),
    );

  const openApprovalForm = (notification) => {
    const request = findPendingRequest(notification);

    if (!request) {
      setFormError(
        "This request is no longer pending or does not belong to your team.",
      );
      return;
    }

    setSelectedRequest(request);
    setManagerReason("");
    setApprovedHours("1");
    setFormError("");
  };

  const openAssignmentDetails = (notification) => {
    const assignment = findAssignment(notification);

    if (!assignment || assignment.status !== "ASSIGNED") {
      setAssignmentActionError(
        "This assignment is no longer available for acceptance.",
      );
      return;
    }

    setSelectedAssignment(assignment);
    setAssignmentActionError("");
  };

  const submitDecision = (decision) => {
    if (!selectedRequest) return;

    const reason = managerReason.trim();
    const hours = Number(approvedHours);

    if (reason.length < 3 || reason.length > 500) {
      setFormError("Enter a decision reason between 3 and 500 characters.");
      return;
    }

    if (
      decision === "approve" &&
      (!Number.isInteger(hours) || hours < 1 || hours > 12)
    ) {
      setFormError(
        "Approved extra time must be a whole number between 1 and 12 hours.",
      );
      return;
    }

    decisionMutation.mutate({
      requestId: selectedRequest._id,
      decision,
      data: {
        managerReason: reason,
        ...(decision === "approve"
          ? { approvedDurationMinutes: hours * 60 }
          : {}),
      },
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error?.response?.data?.message ||
          error?.message ||
          "Failed to load notifications."}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0, pb: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <NotificationsActive />
            <Typography variant="h4" fontWeight={700}>
              Notifications
            </Typography>
          </Stack>

          <Typography color="text.secondary">
            You have {unreadCount} unread notification
            {unreadCount === 1 ? "" : "s"}.
          </Typography>
        </Box>

        {/* Extra-duty creation now belongs on Task Management. */}
        <Button
          variant="outlined"
          startIcon={<DoneAll />}
          disabled={unreadCount === 0 || markAllReadMutation.isPending}
          onClick={() => markAllReadMutation.mutate()}
        >
          Mark All as Read
        </Button>
      </Stack>

      {(markReadMutation.isError || markAllReadMutation.isError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(markReadMutation.error || markAllReadMutation.error)?.response
            ?.data?.message || "Failed to update notifications."}
        </Alert>
      )}

      {notifications.length === 0 ? (
        <Alert severity="info">You have no notifications.</Alert>
      ) : (
        <Stack spacing={2}>
          {notifications.map((notification) => {
            const isExtraWorkRequest =
              notification.type === "EXTRA_WORK_REQUEST";

            const requestIsPending =
              isExtraWorkRequest &&
              Boolean(findPendingRequest(notification));

            const isExtraWorkAssignment =
              notification.type === "EXTRA_WORK_ASSIGNED";

            const assignmentIsPending =
              isExtraWorkAssignment &&
              findAssignment(notification)?.status === "ASSIGNED";

            return (
              <Card
                key={notification._id}
                variant="outlined"
                sx={{
                  backgroundColor: notification.isRead
                    ? "background.paper"
                    : "action.hover",
                }}
              >
                <CardContent>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Typography variant="h6" fontWeight={600}>
                          {notification.title}
                        </Typography>

                        <Chip
                          size="small"
                          label={formatType(notification.type)}
                        />

                        {!notification.isRead && (
                          <Chip size="small" color="primary" label="Unread" />
                        )}
                      </Stack>

                      <Typography sx={{ mt: 1 }}>
                        {notification.message}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {formatDateTime(notification.createdAt)}
                      </Typography>
                    </Box>

                    <Stack
                      direction={{ xs: "row", md: "column" }}
                      spacing={1}
                      alignItems="stretch"
                    >
                      {requestIsPending && isManager && (
                        <Button
                          variant="contained"
                          startIcon={<PlayArrow />}
                          onClick={() => openApprovalForm(notification)}
                        >
                          Review Request
                        </Button>
                      )}

                      {assignmentIsPending && isEmployee && (
                        <Button
                          variant="contained"
                          startIcon={<PlayArrow />}
                          onClick={() => openAssignmentDetails(notification)}
                        >
                          View and Accept
                        </Button>
                      )}

                      {!notification.isRead && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            markReadMutation.mutate(notification._id)
                          }
                          disabled={markReadMutation.isPending}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Employee's extra-duty assignments and recorded times */}
      {isEmployee && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            My Extra-Duty Assignments
          </Typography>

          {assignmentsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={26} />
            </Box>
          ) : assignmentsError ? (
            <Alert severity="error">
              {assignmentsErrorDetails?.response?.data?.message ||
                assignmentsErrorDetails?.message ||
                "Could not load extra-duty assignments."}
            </Alert>
          ) : assignments.length === 0 ? (
            <Alert severity="info">
              You have no extra-duty assignments.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {assignments.map((assignment) => (
                <Card key={assignment._id} variant="outlined">
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={700}>
                          {assignment.taskTitle || "Extra Duty"}
                        </Typography>

                        <Typography color="text.secondary">
                          {assignment.taskDescription ||
                            assignment.employeeReason ||
                            "No job details provided."}
                        </Typography>

                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Team: {assignment.teamId?.name || "—"}
                        </Typography>

                        <Typography variant="body2">
                          Assigned by: {assignment.assignedBy?.name || "—"}
                        </Typography>

                        <Typography variant="body2">
                          Start: {formatDateTime(assignment.actualStartAt)}
                        </Typography>

                        <Typography variant="body2">
                          Scheduled end: {formatDateTime(assignment.approvedEndAt)}
                        </Typography>

                        <Typography variant="body2">
                          Actual checkout: {formatDateTime(assignment.actualEndAt)}
                        </Typography>
                      </Box>

                      <Stack spacing={1} alignItems="flex-start">
                        <Chip
                          label={formatType(assignment.status)}
                          color={
                            assignment.status === "COMPLETED"
                              ? "success"
                              : assignment.status === "ASSIGNED"
                                ? "warning"
                                : assignment.status === "APPROVED"
                                  ? "info"
                                  : "default"
                          }
                        />

                        {assignment.status === "ASSIGNED" && (
                          <Button
                            variant="contained"
                            onClick={() => {
                              setAssignmentActionError("");
                              setSelectedAssignment(assignment);
                            }}
                          >
                            Review Assignment
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* Employee reviews and accepts or declines manager-created extra duty */}
      <Dialog
        open={Boolean(selectedAssignment)}
        onClose={() => {
          if (
            !acceptAssignmentMutation.isPending &&
            !rejectAssignmentMutation.isPending
          ) {
            setSelectedAssignment(null);
            setAssignmentActionError("");
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Extra-Duty Details</DialogTitle>

        <DialogContent>
          {selectedAssignment && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Alert severity="info">
                <Typography fontWeight={700}>
                  {selectedAssignment.taskTitle || "Extra Duty"}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  {selectedAssignment.taskDescription ||
                    selectedAssignment.employeeReason ||
                    "No job details provided."}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  Team: {selectedAssignment.teamId?.name || "—"}
                </Typography>

                <Typography>
                  Assigned by: {selectedAssignment.assignedBy?.name || "—"}
                </Typography>

                <Typography>
                  Expected duration:{" "}
                  {selectedAssignment.approvedDurationMinutes
                    ? `${selectedAssignment.approvedDurationMinutes} minutes`
                    : "As specified by manager"}
                </Typography>
              </Alert>

              <Typography variant="body2" color="text.secondary">
                Accepting records your extra-duty check-in through the backend.
                The session should end at the approved deadline, or you can
                check out early if your work is finished.
              </Typography>

              {assignmentActionError && (
                <Alert severity="error">{assignmentActionError}</Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            color="error"
            onClick={() =>
              selectedAssignment &&
              rejectAssignmentMutation.mutate(selectedAssignment._id)
            }
            disabled={
              acceptAssignmentMutation.isPending ||
              rejectAssignmentMutation.isPending
            }
          >
            Decline
          </Button>

          <Button
            onClick={() => {
              setSelectedAssignment(null);
              setAssignmentActionError("");
            }}
            disabled={
              acceptAssignmentMutation.isPending ||
              rejectAssignmentMutation.isPending
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              selectedAssignment &&
              acceptAssignmentMutation.mutate(selectedAssignment._id)
            }
            disabled={
              acceptAssignmentMutation.isPending ||
              rejectAssignmentMutation.isPending
            }
          >
            {acceptAssignmentMutation.isPending
              ? "Accepting..."
              : "Accept and Check In"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manager reviews extra-work requests submitted by employees */}
      <Dialog
        open={Boolean(selectedRequest)}
        onClose={() => {
          if (!decisionMutation.isPending) {
            setSelectedRequest(null);
            setFormError("");
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Review Employee Extra-Work Request</DialogTitle>

        <DialogContent>
          {selectedRequest && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Alert severity="info">
                <Typography>
                  Employee: {selectedRequest.employeeId?.name || "Employee"}
                </Typography>
                <Typography>
                  Team: {selectedRequest.teamId?.name || "Team"}
                </Typography>
                <Typography>
                  Requested: {formatDateTime(selectedRequest.requestedAt)}
                </Typography>
                <Typography>
                  Employee reason: {selectedRequest.employeeReason || "—"}
                </Typography>
              </Alert>

              <TextField
                label="Approved duration (hours)"
                type="number"
                value={approvedHours}
                onChange={(event) => setApprovedHours(event.target.value)}
                inputProps={{ min: 1, max: 12, step: 1 }}
                fullWidth
              />

              <TextField
                label="Manager decision reason"
                value={managerReason}
                onChange={(event) => setManagerReason(event.target.value)}
                inputProps={{ maxLength: 500 }}
                multiline
                minRows={3}
                required
                fullWidth
              />

              {formError && <Alert severity="error">{formError}</Alert>}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => submitDecision("reject")}
            color="error"
            disabled={decisionMutation.isPending}
          >
            Reject
          </Button>

          <Button
            onClick={() => {
              setSelectedRequest(null);
              setFormError("");
            }}
            disabled={decisionMutation.isPending}
          >
            Cancel
          </Button>

          <Button
            onClick={() => submitDecision("approve")}
            variant="contained"
            disabled={decisionMutation.isPending}
          >
            {decisionMutation.isPending ? "Processing..." : "Approve and Start"}
          </Button>
        </DialogActions>
      </Dialog>

      {isManager && requestsError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {requestsErrorDetails?.response?.data?.message ||
            requestsErrorDetails?.message ||
            "Could not load pending employee extra-work requests."}
        </Alert>
      )}

      {isManager && requestsLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
}

export default Notifications;
