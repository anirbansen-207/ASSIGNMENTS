import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useState } from "react";

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
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
  LinearProgress,
  Divider,
} from "@mui/material";

import { AccessTime } from "@mui/icons-material";

import {
  getMyTasksApi,
  acceptTaskApi,
  updateTaskProgressApi,
  updateTaskStatusApi,
} from "../../api/taskApi";

import {
  getMyExtraWorkAssignmentsApi,
  checkOutExtraWorkApi,
} from "../../api/attendanceApi";

// Consistent colors for the employee pages.
const primaryBlue = "#1976d2";
const lightBlue = "#eaf3ff";
const borderColor = "#e5eaf1";

// Display task status in a readable format.
const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
};

// Display task priority in a readable format.
const formatPriority = (priority) => {
  if (!priority) return "N/A";

  return (
    priority.charAt(0).toUpperCase() +
    priority.slice(1).toLowerCase()
  );
};

// Return a suitable color for the task status.
const getStatusColor = (status) => {
  switch (status) {
    case "COMPLETED":
      return "success";

    case "IN_PROGRESS":
      return "primary";

    case "IN_REVIEW":
      return "info";

    case "BLOCKED":
    case "REWORK_REQUIRED":
      return "error";

    case "ASSIGNED":
    case "ACCEPTED":
      return "warning";

    default:
      return "default";
  }
};

const MyTasks = () => {
  const queryClient = useQueryClient();

  // Dialog state.
  const [progressTask, setProgressTask] = useState(null);
  const [statusTask, setStatusTask] = useState(null);

  // Form state for progress updates.
  const [progressData, setProgressData] = useState({
    progress: 0,
    actualHours: 0,
  });

  const [selectedStatus, setSelectedStatus] = useState("");

  // Fetch tasks assigned to the logged-in employee.
  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["myTasks"],
    queryFn: getMyTasksApi,
  });

  // Ignore null or invalid entries returned by the API.
  // This prevents null tasks from crashing the page.
  const safeTasks = Array.isArray(tasks)
    ? tasks.filter(
        (task) =>
          task &&
          typeof task === "object" &&
          task._id,
      )
    : [];

  // Fetch manager-created extra-duty assignments.
  const {
    data: extraDutyAssignments = [],
    isLoading: isLoadingExtraDuty,
    error: extraDutyError,
  } = useQuery({
    queryKey: ["my-extra-work-assignments"],
    queryFn: getMyExtraWorkAssignmentsApi,
    refetchInterval: 15000,
  });

  // Complete an accepted extra-duty session.
  const {
    mutate: completeExtraDuty,
    isPending: isCompletingExtraDuty,
    variables: completingAssignmentId,
    error: completeExtraDutyError,
  } = useMutation({
    mutationFn: checkOutExtraWorkApi,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["my-extra-work-assignments"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["my-extra-work-requests"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["extra-time-summary"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["my-attendance"],
        }),
      ]);
    },
  });

  // Accept an assigned normal task.
  const {
    mutate: acceptTask,
    isPending: isAccepting,
    variables: acceptingTaskId,
    error: acceptError,
  } = useMutation({
    mutationFn: acceptTaskApi,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["myTasks"],
      });
    },
  });

  // Update progress and actual hours.
  const {
    mutate: updateProgress,
    isPending: isUpdatingProgress,
    error: progressError,
  } = useMutation({
    mutationFn: ({ taskId, progressData }) =>
      updateTaskProgressApi(taskId, progressData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["myTasks"],
      });

      setProgressTask(null);
    },
  });

  // Update normal task status.
  const {
    mutate: updateStatus,
    isPending: isUpdatingStatus,
    error: statusError,
  } = useMutation({
    mutationFn: ({ taskId, status }) =>
      updateTaskStatusApi(taskId, status),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["myTasks"],
      });

      setStatusTask(null);
      setSelectedStatus("");
    },
  });

  // Open the progress dialog.
  const handleOpenProgress = (task) => {
    if (!task || !task._id) return;

    setProgressTask(task);

    setProgressData({
      progress: Number(task.progress) || 0,
      actualHours: Number(task.actualHours) || 0,
    });
  };

  // Submit progress changes.
  const handleProgressSubmit = () => {
    if (!progressTask || !progressTask._id) {
      return;
    }

    const progress = Number(progressData.progress);
    const actualHours = Number(progressData.actualHours);

    // Validate values before sending them to the API.
    if (
      !Number.isFinite(progress) ||
      progress < 0 ||
      progress > 100 ||
      !Number.isFinite(actualHours) ||
      actualHours < 0
    ) {
      return;
    }

    updateProgress({
      taskId: progressTask._id,
      progressData: {
        progress,
        actualHours,
      },
    });
  };

  // Open the status dialog.
  const handleOpenStatus = (task) => {
    if (!task || !task._id) return;

    setStatusTask(task);
    setSelectedStatus("");
  };

  // Preserve the existing backend-supported status transitions.
  const getStatusOptions = (task) => {
    if (!task || !task.status) {
      return [];
    }

    if (task.status === "ACCEPTED") {
      return ["IN_PROGRESS"];
    }

    if (task.status === "REWORK_REQUIRED") {
      return ["IN_PROGRESS"];
    }

    if (task.status === "IN_PROGRESS") {
      return ["BLOCKED", "IN_REVIEW"];
    }

    return [];
  };

  // Submit a status change.
  const handleStatusSubmit = () => {
    if (
      !statusTask ||
      !statusTask._id ||
      !selectedStatus
    ) {
      return;
    }

    // Ensure the selected value is allowed for this task.
    const allowedStatuses = getStatusOptions(statusTask);

    if (!allowedStatuses.includes(selectedStatus)) {
      return;
    }

    updateStatus({
      taskId: statusTask._id,
      status: selectedStatus,
    });
  };

  // Close dialogs safely.
  const handleCloseProgress = () => {
    if (isUpdatingProgress) return;

    setProgressTask(null);
  };

  const handleCloseStatus = () => {
    if (isUpdatingStatus) return;

    setStatusTask(null);
    setSelectedStatus("");
  };

  // Format extra-duty timestamps consistently.
  const formatExtraDutyDateTime = (value) => {
    if (!value) return "Not recorded";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not recorded";
    }

    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
  };

  // Loading state for normal tasks.
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 280,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          bgcolor: "#ffffff",
        }}
      >
        <CircularProgress
          size={34}
          sx={{ color: primaryBlue }}
        />

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Loading your tasks...
        </Typography>
      </Box>
    );
  }

  // Normal-task query error state.
  if (error) {
    return (
      <Box sx={{ bgcolor: "#ffffff" }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 3,
            fontSize: {
              xs: "1.6rem",
              sm: "2rem",
            },
          }}
        >
          My Tasks
        </Typography>

        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          }
        >
          {error.response?.data?.message ||
            error.message ||
            "Unable to load your tasks."}
        </Alert>
      </Box>
    );
  }

  const mutationError =
    acceptError || progressError || statusError;

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        bgcolor: "#ffffff",
        pb: 3,
      }}
    >
      {/* Page heading */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: "#172b4d",
            fontSize: {
              xs: "1.6rem",
              sm: "2rem",
            },
            letterSpacing: "-0.5px",
          }}
        >
          My Tasks
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.75 }}
        >
          View your assigned tasks and update your progress.
        </Typography>
      </Box>

      {/* Normal-task mutation errors */}
      {mutationError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {mutationError.response?.data?.message ||
            mutationError.message ||
            "The requested task operation failed."}
        </Alert>
      )}

      {/* Normal tasks section */}
      <Box>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: "#172b4d", mb: 2 }}
        >
          Tasks
        </Typography>

        {safeTasks.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${borderColor}`,
              borderRadius: "12px",
            }}
          >
            <CardContent
              sx={{
                py: 5,
                px: 2,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  mx: "auto",
                  mb: 2,
                  borderRadius: "12px",
                  bgcolor: lightBlue,
                  color: primaryBlue,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                ✓
              </Box>

              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 1, color: "#172b4d" }}
              >
                No Tasks Assigned
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                You currently have no tasks assigned to you.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Task count */}
            <Box sx={{ mb: 2.5 }}>
              <Chip
                label={`${safeTasks.length} ${
                  safeTasks.length === 1 ? "Task" : "Tasks"
                }`}
                sx={{
                  bgcolor: lightBlue,
                  color: primaryBlue,
                  fontWeight: 700,
                }}
              />
            </Box>

            {/* Task cards */}
            <Grid container spacing={2}>
              {safeTasks.map((task) => {
                const statusOptions = getStatusOptions(task);

                const progress = Math.min(
                  100,
                  Math.max(0, Number(task.progress) || 0),
                );

                const dueDate = task.dueDate
                  ? new Date(task.dueDate)
                  : null;

                const formattedDueDate =
                  dueDate && !Number.isNaN(dueDate.getTime())
                    ? dueDate.toLocaleDateString()
                    : "N/A";

                return (
                  <Grid
                    key={task._id}
                    size={{
                      xs: 12,
                      sm: 6,
                      lg: 4,
                    }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "12px",
                        transition:
                          "border-color 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          borderColor: "#b7d4ff",
                          boxShadow:
                            "0 4px 16px rgba(25, 118, 210, 0.08)",
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 2.5,
                          "&:last-child": {
                            pb: 2.5,
                          },
                        }}
                      >
                        {/* Task title and status */}
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="flex-start"
                          justifyContent="space-between"
                          sx={{ mb: 1.5 }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                              color: "#172b4d",
                              fontSize: "1.05rem",
                              overflowWrap: "anywhere",
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            {task.title || "Untitled Task"}
                          </Typography>

                          <Chip
                            size="small"
                            color={getStatusColor(task.status)}
                            label={formatStatus(task.status)}
                            sx={{
                              fontWeight: 600,
                              maxWidth: "48%",
                              "& .MuiChip-label": {
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              },
                            }}
                          />
                        </Stack>

                        {/* Task description */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            lineHeight: 1.7,
                            minHeight: 40,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {task.description || "No description available."}
                        </Typography>

                        <Divider sx={{ my: 2, borderColor }} />

                        {/* Task details */}
                        <Stack spacing={1.5}>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Priority
                            </Typography>

                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                size="small"
                                variant="outlined"
                                label={formatPriority(task.priority)}
                              />
                            </Box>
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              Team
                            </Typography>

                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ mt: 0.3 }}
                            >
                              {task.teamId?.name || "N/A"}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              Due Date
                            </Typography>

                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ mt: 0.3 }}
                            >
                              {formattedDueDate}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Task progress */}
                        <Box sx={{ mt: 2.5 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 1 }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              Progress
                            </Typography>

                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="primary.main"
                            >
                              {progress}%
                            </Typography>
                          </Stack>

                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 7,
                              borderRadius: 5,
                              bgcolor: "#e8eef7",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 5,
                                bgcolor: primaryBlue,
                              },
                            }}
                          />
                        </Box>

                        {/* Normal task actions */}
                        <Stack
                          direction="row"
                          flexWrap="wrap"
                          gap={1}
                          sx={{ mt: 2.5 }}
                        >
                          {task.status === "ASSIGNED" && (
                            <Button
                              size="small"
                              variant="contained"
                              disabled={
                                isAccepting &&
                                acceptingTaskId === task._id
                              }
                              onClick={() => acceptTask(task._id)}
                              sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                              }}
                            >
                              {isAccepting &&
                              acceptingTaskId === task._id
                                ? "Accepting..."
                                : "Accept"}
                            </Button>
                          )}

                          {task.status !== "COMPLETED" && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleOpenProgress(task)}
                              sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                              }}
                            >
                              Update Progress
                            </Button>
                          )}

                          {statusOptions.length > 0 && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleOpenStatus(task)}
                              sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                              }}
                            >
                              Update Status
                            </Button>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Separate section for manager-created extra duty */}
      <Box>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: "#172b4d", mb: 1 }}
        >
          My Extra Duty
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          View your extra-duty assignments and complete active work when finished.
        </Typography>

        {extraDutyError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {extraDutyError.response?.data?.message ||
              extraDutyError.message ||
              "Unable to load your extra-duty assignments."}
          </Alert>
        )}

        {completeExtraDutyError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {completeExtraDutyError.response?.data?.message ||
              completeExtraDutyError.message ||
              "Could not complete extra duty."}
          </Alert>
        )}

        {isLoadingExtraDuty ? (
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${borderColor}`,
              borderRadius: "12px",
            }}
          >
            <CardContent sx={{ py: 4, textAlign: "center" }}>
              <CircularProgress
                size={28}
                sx={{ color: primaryBlue, mb: 1 }}
              />

              <Typography variant="body2" color="text.secondary">
                Loading extra-duty assignments...
              </Typography>
            </CardContent>
          </Card>
        ) : !Array.isArray(extraDutyAssignments) ||
          extraDutyAssignments.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${borderColor}`,
              borderRadius: "12px",
            }}
          >
            <CardContent sx={{ py: 4, textAlign: "center" }}>
              <Typography
                fontWeight={700}
                sx={{ color: "#172b4d", mb: 1 }}
              >
                No Extra Duty Assigned
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Extra-duty assignments accepted from Notifications will appear here.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {extraDutyAssignments
              .filter((assignment) => assignment && assignment._id)
              .map((assignment) => {
                const status = String(
                  assignment.status || "ASSIGNED",
                ).toUpperCase();

                const completed =
                  status === "COMPLETED" ||
                  Boolean(assignment.actualEndAt);

                const active =
                  status === "APPROVED" &&
                  Boolean(assignment.actualStartAt) &&
                  !assignment.actualEndAt;

                const pending = status === "ASSIGNED";

                const statusLabel = completed
                  ? "Completed"
                  : active
                    ? "Ongoing"
                    : pending
                      ? "Pending Acceptance"
                      : formatStatus(status);

                const statusColor = completed
                  ? "success"
                  : active
                    ? "info"
                    : pending
                      ? "warning"
                      : "default";

                const managerName =
                  assignment.assignedBy?.name ||
                  assignment.approvedBy?.name ||
                  "Not available";

                const extraMinutes = Math.max(
                  0,
                  Number(assignment.actualExtraMinutes) || 0,
                );

                return (
                  <Grid
                    key={assignment._id}
                    size={{
                      xs: 12,
                      sm: 6,
                      lg: 4,
                    }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "12px",
                        transition:
                          "border-color 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          borderColor: "#b7d4ff",
                          boxShadow:
                            "0 4px 16px rgba(25, 118, 210, 0.08)",
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 2.5,
                          "&:last-child": { pb: 2.5 },
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="flex-start"
                          justifyContent="space-between"
                          sx={{ mb: 1.5 }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                              color: "#172b4d",
                              fontSize: "1.05rem",
                              overflowWrap: "anywhere",
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            {assignment.taskTitle || "Extra Duty"}
                          </Typography>

                          <Chip
                            size="small"
                            color={statusColor}
                            label={statusLabel}
                            sx={{ fontWeight: 600 }}
                          />
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            lineHeight: 1.7,
                            minHeight: 40,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {assignment.taskDescription ||
                            assignment.employeeReason ||
                            "No description available."}
                        </Typography>

                        <Divider sx={{ my: 2, borderColor }} />

                        <Stack spacing={1.25}>
                          <Typography variant="body2">
                            <strong>Manager:</strong>{" "}
                            {managerName}
                          </Typography>

                          <Typography variant="body2">
                            <strong>Team:</strong>{" "}
                            {assignment.teamId?.name || "N/A"}
                          </Typography>

                          <Typography variant="body2">
                            <strong>Assigned:</strong>{" "}
                            {formatExtraDutyDateTime(
                              assignment.requestedAt ||
                                assignment.createdAt,
                            )}
                          </Typography>

                          <Typography variant="body2">
                            <strong>Started:</strong>{" "}
                            {formatExtraDutyDateTime(
                              assignment.actualStartAt,
                            )}
                          </Typography>

                          <Typography variant="body2">
                            <strong>Scheduled end:</strong>{" "}
                            {formatExtraDutyDateTime(
                              assignment.approvedEndAt,
                            )}
                          </Typography>

                          {completed && (
                            <>
                              <Typography variant="body2">
                                <strong>Actual checkout:</strong>{" "}
                                {formatExtraDutyDateTime(
                                  assignment.actualEndAt,
                                )}
                              </Typography>

                              <Typography variant="body2">
                                <strong>Actual extra time:</strong>{" "}
                                {Math.floor(extraMinutes / 60)}h{" "}
                                {extraMinutes % 60}m
                              </Typography>
                            </>
                          )}
                        </Stack>

                        {active && (
                          <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            startIcon={<AccessTime />}
                            sx={{
                              mt: 2,
                              textTransform: "none",
                              borderRadius: "8px",
                            }}
                            disabled={isCompletingExtraDuty}
                            onClick={() => {
                              const confirmed = window.confirm(
                                "Complete this extra-duty session now? Your checkout time will be recorded.",
                              );

                              if (confirmed) {
                                completeExtraDuty(assignment._id);
                              }
                            }}
                          >
                            {isCompletingExtraDuty &&
                            completingAssignmentId === assignment._id
                              ? "Completing..."
                              : "Complete Extra Duty"}
                          </Button>
                        )}

                        {pending && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            Accept this assignment from Notifications before starting extra duty.
                          </Alert>
                        )}

                        {completed && (
                          <Alert severity="success" sx={{ mt: 2 }}>
                            This extra-duty session is completed.
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
          </Grid>
        )}
      </Box>

      {/* Update progress dialog */}
      <Dialog
        open={Boolean(progressTask)}
        onClose={handleCloseProgress}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Update Progress
        </DialogTitle>

        <DialogContent>
          {progressTask && (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, mb: 2 }}
              >
                {progressTask.title || "Untitled Task"}
              </Typography>

              <Typography
                variant="body2"
                fontWeight={600}
              >
                Progress: {progressData.progress}%
              </Typography>

              <Slider
                value={Number(progressData.progress) || 0}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                onChange={(_event, value) => {
                  setProgressData((previous) => ({
                    ...previous,
                    progress: value,
                  }));
                }}
                sx={{ color: primaryBlue }}
              />

              <TextField
                fullWidth
                label="Actual Hours"
                type="number"
                value={progressData.actualHours}
                onChange={(event) => {
                  setProgressData((previous) => ({
                    ...previous,
                    actualHours: event.target.value,
                  }));
                }}
                slotProps={{
                  htmlInput: {
                    min: 0,
                    step: 0.5,
                  },
                }}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={handleCloseProgress}
            disabled={isUpdatingProgress}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleProgressSubmit}
            disabled={isUpdatingProgress}
            sx={{ textTransform: "none" }}
          >
            {isUpdatingProgress ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Update"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update status dialog */}
      <Dialog
        open={Boolean(statusTask)}
        onClose={handleCloseStatus}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Update Status
        </DialogTitle>

        <DialogContent>
          {statusTask && (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, mb: 2 }}
              >
                {statusTask.title || "Untitled Task"}
              </Typography>

              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel id="task-status-label">
                  Status
                </InputLabel>

                <Select
                  labelId="task-status-label"
                  label="Status"
                  value={selectedStatus}
                  onChange={(event) => {
                    setSelectedStatus(event.target.value);
                  }}
                >
                  {getStatusOptions(statusTask).map((status) => (
                    <MenuItem key={status} value={status}>
                      {formatStatus(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {getStatusOptions(statusTask).length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No status changes are currently available for this task.
                </Alert>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={handleCloseStatus}
            disabled={isUpdatingStatus}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleStatusSubmit}
            disabled={
              !selectedStatus ||
              isUpdatingStatus ||
              !getStatusOptions(statusTask).includes(selectedStatus)
            }
            sx={{ textTransform: "none" }}
          >
            {isUpdatingStatus ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Update"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyTasks;