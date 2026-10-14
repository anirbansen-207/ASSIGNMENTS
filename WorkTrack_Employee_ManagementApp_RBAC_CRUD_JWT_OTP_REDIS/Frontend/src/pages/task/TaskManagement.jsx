import { useContext, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Add, Delete, Edit, Visibility, AccessTime } from "@mui/icons-material";
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
  Paper,
  Select,
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
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContextValue";
import { getAllUsers } from "../../api/adminApi";
import { viewEmployeesApi } from "../../api/managerApi";
import { getAllTeamsApi } from "../../api/teamApi";
import {
  createTaskApi,
  deleteTaskApi,
  getAllTasksApi,
  updateTaskApi,
  updateTaskProgressApi,
  updateTaskStatusApi,
} from "../../api/taskApi";
import {
  createExtraWorkAssignmentApi,
  getManagerExtraWorkAssignmentsApi,
  deleteExtraWorkAssignmentApi,
} from "../../api/attendanceApi";

const initialTaskForm = {
  title: "",
  description: "",
  assignedTo: "",
  teamId: "",
  priority: "MEDIUM",
  startDate: "",
  dueDate: "",
  estimatedHours: "",
};

const initialExtraDutyForm = {
  targetType: "team",
  teamId: "",
  employeeId: "",
  title: "",
  description: "",
  durationHours: "1",
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const getId = (value) =>
  value && typeof value === "object" ? value._id : value;

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getExtraDutyStatus = (assignment) => {
  if (assignment.status === "ASSIGNED") return "Pending";
  if (assignment.status === "REJECTED") return "Rejected";
  if (assignment.status === "EXPIRED") return "Expired";
  if (assignment.actualEndAt || assignment.status === "COMPLETED") {
    return "Completed";
  }
  if (assignment.actualStartAt && !assignment.actualEndAt) {
    return "Ongoing";
  }
  if (assignment.status === "APPROVED") return "Accepted";
  return assignment.status || "Unknown";
};

const getExtraDutyStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "warning";
    case "Accepted":
      return "info";
    case "Ongoing":
      return "primary";
    case "Completed":
      return "success";
    case "Rejected":
    case "Expired":
      return "error";
    default:
      return "default";
  }
};

// Only these statuses are eligible for deletion from the manager's table.
const DELETABLE_EXTRA_DUTY_STATUSES = [
  "ASSIGNED",
  "COMPLETED",
  "EXPIRED",
  "REJECTED",
];

const canDeleteExtraDutyAssignment = (assignment) => {
  if (!assignment) return false;
  // Completed, expired and rejected assignments can be deleted even if
  // they contain historical check-in/check-out timestamps.
  if (["COMPLETED", "EXPIRED", "REJECTED"].includes(assignment.status)) {
    return true;
  }
  // An ASSIGNED entry is deletable only if it has not started.
  return (
    assignment.status === "ASSIGNED" &&
    !assignment.actualStartAt &&
    !assignment.actualEndAt
  );
};

function TaskManagement() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openProgressDialog, setOpenProgressDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [progressForm, setProgressForm] = useState({
    progress: 0,
    actualHours: "",
  });
  const [status, setStatus] = useState("");
  const [taskFormError, setTaskFormError] = useState("");
  const [pageError, setPageError] = useState("");

  const [extraDutyOpen, setExtraDutyOpen] = useState(false);
  const [extraDutyForm, setExtraDutyForm] = useState(initialExtraDutyForm);
  const [extraDutyError, setExtraDutyError] = useState("");

  // Close the Create Task dialog and reset the form.
  // Keep it open while the create request is in progress.
  const closeCreateTaskDialog = () => {
    if (createTaskMutation.isPending) return;
    setOpenCreateDialog(false);
    setTaskForm(initialTaskForm);
    setTaskFormError("");
  };

  const {
    data: usersResponse,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: [isAdmin ? "admin-users" : "manager-employees"],
    queryFn: isAdmin ? getAllUsers : viewEmployeesApi,
    enabled: isAdmin || isManager,
  });

  const users = Array.isArray(usersResponse)
    ? usersResponse
    : Array.isArray(usersResponse?.data)
      ? usersResponse.data
      : Array.isArray(usersResponse?.data?.users)
        ? usersResponse.data.users
        : [];

  const {
    data: teamsResponse,
    isLoading: teamsLoading,
    error: teamsError,
  } = useQuery({
    queryKey: ["all-teams"],
    queryFn: getAllTeamsApi,
    enabled: isAdmin || isManager,
  });

  const teams = Array.isArray(teamsResponse)
    ? teamsResponse
    : Array.isArray(teamsResponse?.data)
      ? teamsResponse.data
      : Array.isArray(teamsResponse?.data?.teams)
        ? teamsResponse.data.teams
        : [];

  const {
    data: tasksResponse,
    isLoading: tasksLoading,
    error: taskError,
  } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: getAllTasksApi,
    enabled: isAdmin || isManager,
  });

  const tasks = Array.isArray(tasksResponse)
    ? tasksResponse
    : Array.isArray(tasksResponse?.data)
      ? tasksResponse.data
      : Array.isArray(tasksResponse?.data?.tasks)
        ? tasksResponse.data.tasks
        : [];

  const {
    data: extraDutyResponse,
    isLoading: extraDutyLoading,
    error: extraDutyLoadError,
  } = useQuery({
    queryKey: ["manager-extra-duty-assignments"],
    queryFn: getManagerExtraWorkAssignmentsApi,
    enabled: isManager,
    refetchInterval: 15000,
  });

  const extraDutyAssignments = Array.isArray(extraDutyResponse)
    ? extraDutyResponse
    : Array.isArray(extraDutyResponse?.data)
      ? extraDutyResponse.data
      : Array.isArray(extraDutyResponse?.data?.assignments)
        ? extraDutyResponse.data.assignments
        : [];

  const employees = useMemo(
    () => users.filter((item) => item.role === "employee"),
    [users],
  );

  const assignableEmployees = useMemo(() => {
    if (!taskForm.teamId) return [];
    return employees.filter(
      (employee) => String(getId(employee.teamId)) === String(taskForm.teamId),
    );
  }, [employees, taskForm.teamId]);

  const extraDutyEmployees = useMemo(() => {
    if (!extraDutyForm.teamId) return [];
    return employees.filter(
      (employee) =>
        String(getId(employee.teamId)) === String(extraDutyForm.teamId),
    );
  }, [employees, extraDutyForm.teamId]);

  const hasInvalidTaskDates =
    Boolean(taskForm.startDate) &&
    Boolean(taskForm.dueDate) &&
    taskForm.dueDate < taskForm.startDate;

  const isCreateFormInvalid =
    !taskForm.title.trim() ||
    !taskForm.assignedTo ||
    !taskForm.teamId ||
    !taskForm.startDate ||
    !taskForm.dueDate ||
    hasInvalidTaskDates;

  const refreshTasks = async () => {
    await queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
  };

  const refreshExtraDuty = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["manager-extra-duty-assignments"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["my-extra-work-assignments"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["my-notifications"],
      }),
    ]);
  };

  const createTaskMutation = useMutation({
    mutationFn: createTaskApi,
    onSuccess: async () => {
      await refreshTasks();
      setOpenCreateDialog(false);
      setTaskForm(initialTaskForm);
      setTaskFormError("");
    },
    onError: (error) => {
      setTaskFormError(getErrorMessage(error, "Failed to create task."));
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => updateTaskApi(taskId, data),
    onSuccess: async () => {
      await refreshTasks();
      setOpenEditDialog(false);
      setSelectedTask(null);
      setTaskFormError("");
    },
    onError: (error) => {
      setTaskFormError(getErrorMessage(error, "Failed to update task."));
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTaskApi,
    onSuccess: refreshTasks,
    onError: (error) => {
      setPageError(getErrorMessage(error, "Failed to delete task."));
    },
  });

  const progressMutation = useMutation({
    mutationFn: ({ taskId, data }) => updateTaskProgressApi(taskId, data),
    onSuccess: async () => {
      await refreshTasks();
      setOpenProgressDialog(false);
      setSelectedTask(null);
    },
    onError: (error) => {
      setPageError(getErrorMessage(error, "Failed to update task progress."));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }) => updateTaskStatusApi(taskId, status),
    onSuccess: async () => {
      await refreshTasks();
      setOpenStatusDialog(false);
      setSelectedTask(null);
      setStatus("");
    },
    onError: (error) => {
      setPageError(getErrorMessage(error, "Failed to update task status."));
    },
  });

  const extraDutyMutation = useMutation({
    mutationFn: createExtraWorkAssignmentApi,
    onSuccess: async () => {
      await refreshExtraDuty();
      setExtraDutyOpen(false);
      setExtraDutyForm(initialExtraDutyForm);
      setExtraDutyError("");
    },
    onError: (error) => {
      setExtraDutyError(
        getErrorMessage(error, "Failed to create extra-duty assignment."),
      );
    },
  });

  const deleteExtraDutyMutation = useMutation({
    mutationFn: deleteExtraWorkAssignmentApi,
    onSuccess: async () => {
      setPageError("");
      await refreshExtraDuty();
    },
    onError: (error) => {
      setPageError(
        getErrorMessage(error, "Failed to delete extra-duty assignment."),
      );
    },
  });

  const handleTaskFormChange = (event) => {
    const { name, value } = event.target;
    setTaskForm((previous) => {
      if (name === "teamId") {
        return {
          ...previous,
          teamId: value,
          assignedTo: "",
        };
      }
      return { ...previous, [name]: value };
    });
    setTaskFormError("");
  };

  const handleCreateTask = () => {
    if (isCreateFormInvalid) return;
    setTaskFormError("");
    createTaskMutation.mutate({
      ...taskForm,
      estimatedHours:
        taskForm.estimatedHours === ""
          ? undefined
          : Number(taskForm.estimatedHours),
    });
  };

  const handleOpenEdit = (task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      assignedTo: getId(task.assignedTo) || "",
      teamId: getId(task.teamId) || "",
      priority: task.priority || "MEDIUM",
      startDate: task.startDate ? task.startDate.substring(0, 10) : "",
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : "",
      estimatedHours: task.estimatedHours ?? "",
    });
    setTaskFormError("");
    setOpenEditDialog(true);
  };

  const handleUpdateTask = () => {
    if (!selectedTask) return;
    if (
      !taskForm.title.trim() ||
      !taskForm.startDate ||
      !taskForm.dueDate ||
      hasInvalidTaskDates
    ) {
      setTaskFormError("Check the task title and dates before saving.");
      return;
    }
    setTaskFormError("");
    updateTaskMutation.mutate({
      taskId: selectedTask._id,
      data: {
        title: taskForm.title.trim(),
        description: taskForm.description,
        priority: taskForm.priority,
        startDate: taskForm.startDate,
        dueDate: taskForm.dueDate,
        estimatedHours:
          taskForm.estimatedHours === ""
            ? undefined
            : Number(taskForm.estimatedHours),
      },
    });
  };

  const handleOpenProgress = (task) => {
    setSelectedTask(task);
    setProgressForm({
      progress: task.progress ?? 0,
      actualHours: task.actualHours ?? "",
    });
    setOpenProgressDialog(true);
  };

  const handleUpdateProgress = () => {
    if (!selectedTask) return;
    const progress = Number(progressForm.progress);
    const actualHours =
      progressForm.actualHours === ""
        ? undefined
        : Number(progressForm.actualHours);
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      setPageError("Progress must be between 0 and 100.");
      return;
    }
    if (
      actualHours !== undefined &&
      (!Number.isFinite(actualHours) || actualHours < 0)
    ) {
      setPageError("Actual hours must be zero or greater.");
      return;
    }
    setPageError("");
    progressMutation.mutate({
      taskId: selectedTask._id,
      data: { progress, actualHours },
    });
  };

  const handleOpenStatus = (task) => {
    if (isManager && task.status !== "IN_REVIEW") return;

    setSelectedTask(task);
    setStatus(isManager ? "" : task.status || "ASSIGNED");
    setOpenStatusDialog(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedTask || !status) return;
    statusMutation.mutate({
      taskId: selectedTask._id,
      status,
    });
  };

  const handleDeleteTask = (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }
    setPageError("");
    deleteTaskMutation.mutate(taskId);
  };

  const handleDeleteExtraDuty = (assignment) => {
    if (!assignment?._id) {
      setPageError("Cannot delete assignment: assignment ID is missing.");
      return;
    }
    if (!canDeleteExtraDutyAssignment(assignment)) {
      setPageError(
        "Only assigned, completed, expired, or rejected extra-duty assignments can be deleted. An assigned entry must not have started.",
      );
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete this ${assignment.status.toLowerCase()} extra-duty assignment?`,
      )
    ) {
      return;
    }
    setPageError("");
    deleteExtraDutyMutation.mutate(assignment._id);
  };

  const handleViewDetails = (taskId) => {
    navigate(`${isAdmin ? "/admin/tasks" : "/manager/tasks"}/${taskId}`);
  };

  const handleExtraDutyFormChange = (event) => {
    const { name, value } = event.target;
    setExtraDutyForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "teamId" ? { employeeId: "" } : {}),
    }));
    setExtraDutyError("");
  };

  const handleCreateExtraDuty = () => {
    const durationHours = Number(extraDutyForm.durationHours);
    if (!extraDutyForm.teamId) {
      setExtraDutyError("Please select a team.");
      return;
    }
    if (extraDutyForm.targetType === "employee" && !extraDutyForm.employeeId) {
      setExtraDutyError("Please select an employee.");
      return;
    }
    if (
      extraDutyForm.title.trim().length < 3 ||
      extraDutyForm.title.trim().length > 150
    ) {
      setExtraDutyError("Job title must contain 3 to 150 characters.");
      return;
    }
    if (
      extraDutyForm.description.trim().length < 3 ||
      extraDutyForm.description.trim().length > 1000
    ) {
      setExtraDutyError("Job details must contain 3 to 1000 characters.");
      return;
    }
    if (
      !Number.isInteger(durationHours) ||
      durationHours < 1 ||
      durationHours > 12
    ) {
      setExtraDutyError(
        "Duration must be a whole number between 1 and 12 hours.",
      );
      return;
    }
    setExtraDutyError("");
    extraDutyMutation.mutate({
      targetType: extraDutyForm.targetType,
      teamId: extraDutyForm.teamId,
      ...(extraDutyForm.targetType === "employee"
        ? { employeeId: extraDutyForm.employeeId }
        : {}),
      title: extraDutyForm.title.trim(),
      description: extraDutyForm.description.trim(),
      durationMinutes: durationHours * 60,
    });
  };

  const statusOptions = isAdmin
    ? [
        "ASSIGNED",
        "ACCEPTED",
        "IN_PROGRESS",
        "BLOCKED",
        "IN_REVIEW",
        "REWORK_REQUIRED",
        "COMPLETED",
      ]
    : ["REWORK_REQUIRED", "COMPLETED"];

  const isPageLoading = tasksLoading || teamsLoading || usersLoading;

  if (isPageLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (taskError || teamsError || usersError) {
    const error = taskError || teamsError || usersError;
    return (
      <Alert severity="error">
        {getErrorMessage(error, "Failed to load task management data.")}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0, pb: 3 }}>
      {pageError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPageError("")}>
          {pageError}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" fontWeight={700}>
            Task Management
          </Typography>
          <Typography color="text.secondary">
            Create normal tasks or assign extra duty to a team or employee.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {teams.length} teams available · {tasks.length} tasks
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ flexShrink: 0, alignItems: { xs: "stretch", sm: "center" } }}
        >
          {isManager && (
            <Button
              variant="outlined"
              startIcon={<AccessTime />}
              onClick={() => {
                setExtraDutyForm(initialExtraDutyForm);
                setExtraDutyError("");
                setExtraDutyOpen(true);
              }}
              sx={{ whiteSpace: "nowrap" }}
            >
              Create Extra Task
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setTaskForm(initialTaskForm);
              setTaskFormError("");
              setOpenCreateDialog(true);
            }}
            sx={{ whiteSpace: "nowrap" }}
          >
            Create Task
          </Button>
        </Stack>
      </Box>

      {/* Normal task section */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Tasks
          </Typography>

          {tasks.length === 0 ? (
            <Alert severity="info">No tasks found.</Alert>
          ) : (
            <Grid container spacing={3}>
              {tasks.map((task) => (
                <Grid key={task._id} size={{ xs: 12, md: 6, lg: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            {task.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, overflowWrap: "anywhere" }}
                          >
                            {task.description || "No description"}
                          </Typography>
                        </Box>

                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Chip
                            size="small"
                            label={task.status || "ASSIGNED"}
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            label={task.priority || "MEDIUM"}
                          />
                        </Stack>

                        <Typography variant="body2">
                          <strong>Assigned To:</strong>{" "}
                          {task.assignedTo?.name || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Team:</strong> {task.teamId?.name || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Progress:</strong> {task.progress ?? 0}%
                        </Typography>
                        <Typography variant="body2">
                          <strong>Due Date:</strong> {formatDate(task.dueDate)}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewDetails(task._id)}
                          >
                            View Details
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => handleOpenEdit(task)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenProgress(task)}
                            disabled={task.status === "COMPLETED"}
                          >
                            Progress
                          </Button>
                          {(isAdmin ||
                            (isManager && task.status === "IN_REVIEW")) && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleOpenStatus(task)}
                            >
                              Status
                            </Button>
                          )}
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<Delete />}
                            onClick={() => handleDeleteTask(task._id)}
                            disabled={deleteTaskMutation.isPending}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Extra Duty section */}
      {isManager && (
        <Card variant="outlined" sx={{ mt: 3, borderRadius: 3 }}>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={1}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Extra Duty
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Assignments outside normal shift hours.
                </Typography>
              </Box>
              <Chip
                icon={<AccessTime />}
                label={`${extraDutyAssignments.length} assignment(s)`}
                variant="outlined"
              />
            </Stack>

            {extraDutyLoadError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {getErrorMessage(
                  extraDutyLoadError,
                  "Could not load extra-duty assignments.",
                )}
              </Alert>
            )}

            {extraDutyLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  py: 3,
                }}
              >
                <CircularProgress size={26} />
              </Box>
            ) : extraDutyAssignments.length === 0 ? (
              <Alert severity="info">
                No extra-duty assignments have been created yet.
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small" sx={{ minWidth: 1000 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Job</TableCell>
                      <TableCell>Team</TableCell>
                      <TableCell>Employee</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Assigned At</TableCell>
                      <TableCell>Check In</TableCell>
                      <TableCell>Check Out</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {extraDutyAssignments.map((assignment) => {
                      const dutyStatus = getExtraDutyStatus(assignment);
                      const canDelete =
                        canDeleteExtraDutyAssignment(assignment);
                      return (
                        <TableRow key={assignment._id} hover>
                          <TableCell sx={{ minWidth: 200 }}>
                            <Typography fontWeight={600}>
                              {assignment.taskTitle || "Extra Duty"}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ overflowWrap: "anywhere" }}
                            >
                              {assignment.taskDescription ||
                                assignment.employeeReason ||
                                "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {assignment.teamId?.name || "—"}
                          </TableCell>
                          <TableCell>
                            {assignment.employeeId?.name || "—"}
                          </TableCell>
                          <TableCell>
                            {assignment.approvedDurationMinutes
                              ? `${assignment.approvedDurationMinutes} min`
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(assignment.requestedAt)}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(assignment.actualStartAt)}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(assignment.actualEndAt)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={dutyStatus}
                              color={getExtraDutyStatusColor(dutyStatus)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<Delete />}
                              onClick={() => handleDeleteExtraDuty(assignment)}
                              disabled={
                                !canDelete || deleteExtraDutyMutation.isPending
                              }
                            >
                              {deleteExtraDutyMutation.isPending
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
      {/* Create Task dialog */}

      <Dialog
        open={openCreateDialog}
        onClose={(event, reason) => {
          // Ignore clicks outside the dialog and Escape.
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }

          closeCreateTaskDialog();
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Create Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="Task Title"
                name="title"
                value={taskForm.title}
                onChange={handleTaskFormChange}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                name="description"
                value={taskForm.description}
                onChange={handleTaskFormChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel id="create-task-team-label">Team</InputLabel>
                <Select
                  labelId="create-task-team-label"
                  label="Team"
                  name="teamId"
                  value={taskForm.teamId}
                  onChange={handleTaskFormChange}
                >
                  {teams.map((team) => (
                    <MenuItem key={team._id} value={team._id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required disabled={!taskForm.teamId}>
                <InputLabel id="create-task-employee-label">
                  Assign To
                </InputLabel>
                <Select
                  labelId="create-task-employee-label"
                  label="Assign To"
                  name="assignedTo"
                  value={taskForm.assignedTo}
                  onChange={handleTaskFormChange}
                >
                  {assignableEmployees.map((employee) => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {taskForm.teamId && assignableEmployees.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  No employees from this team are available in the list.
                </Typography>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="create-task-priority-label">
                  Priority
                </InputLabel>
                <Select
                  labelId="create-task-priority-label"
                  label="Priority"
                  name="priority"
                  value={taskForm.priority}
                  onChange={handleTaskFormChange}
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Hours"
                name="estimatedHours"
                value={taskForm.estimatedHours}
                onChange={handleTaskFormChange}
                inputProps={{ min: 0, step: 0.5 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                type="date"
                label="Start Date"
                name="startDate"
                value={taskForm.startDate}
                onChange={handleTaskFormChange}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    minWidth: 0,
                    paddingTop: "14px",
                    paddingBottom: "14px",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                type="date"
                label="Due Date"
                name="dueDate"
                value={taskForm.dueDate}
                onChange={handleTaskFormChange}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    minWidth: 0,
                    paddingTop: "14px",
                    paddingBottom: "14px",
                  },
                }}
              />
            </Grid>
          </Grid>

          {taskFormError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {taskFormError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={closeCreateTaskDialog}
            disabled={createTaskMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTask}
            disabled={createTaskMutation.isPending || isCreateFormInvalid}
          >
            {createTaskMutation.isPending ? "Creating..." : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() =>
          !updateTaskMutation.isPending && setOpenEditDialog(false)
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="Task Title"
                name="title"
                value={taskForm.title}
                onChange={handleTaskFormChange}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                name="description"
                value={taskForm.description}
                onChange={handleTaskFormChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="edit-task-priority-label">Priority</InputLabel>
                <Select
                  labelId="edit-task-priority-label"
                  label="Priority"
                  name="priority"
                  value={taskForm.priority}
                  onChange={handleTaskFormChange}
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Hours"
                name="estimatedHours"
                value={taskForm.estimatedHours}
                onChange={handleTaskFormChange}
                inputProps={{ min: 0, step: 0.5 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                type="date"
                label="Start Date"
                name="startDate"
                value={taskForm.startDate}
                onChange={handleTaskFormChange}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{
                  "& .MuiInputBase-input": {
                    minWidth: 0,
                    paddingTop: "14px",
                    paddingBottom: "14px",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                type="date"
                label="Due Date"
                name="dueDate"
                value={taskForm.dueDate}
                onChange={handleTaskFormChange}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{
                  "& .MuiInputBase-input": {
                    minWidth: 0,
                    paddingTop: "14px",
                    paddingBottom: "14px",
                  },
                }}
              />
            </Grid>
          </Grid>

          {taskFormError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {taskFormError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateTask}
            disabled={updateTaskMutation.isPending}
          >
            {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Progress dialog */}
      <Dialog
        open={openProgressDialog}
        onClose={() =>
          !progressMutation.isPending && setOpenProgressDialog(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Update Task Progress</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              type="number"
              label="Progress (%)"
              value={progressForm.progress}
              onChange={(event) =>
                setProgressForm((previous) => ({
                  ...previous,
                  progress: event.target.value,
                }))
              }
              inputProps={{ min: 0, max: 100 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Actual Hours"
              value={progressForm.actualHours}
              onChange={(event) =>
                setProgressForm((previous) => ({
                  ...previous,
                  actualHours: event.target.value,
                }))
              }
              inputProps={{ min: 0, step: 0.5 }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenProgressDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateProgress}
            disabled={progressMutation.isPending}
          >
            {progressMutation.isPending ? "Updating..." : "Update Progress"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status dialog */}
      <Dialog
        open={openStatusDialog}
        onClose={() => !statusMutation.isPending && setOpenStatusDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Update Task Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="task-status-label">Status</InputLabel>
            <Select
              labelId="task-status-label"
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option.replaceAll("_", " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={!status || statusMutation.isPending}
          >
            {statusMutation.isPending ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manager-created Extra Duty dialog */}
      <Dialog
        open={extraDutyOpen}
        onClose={() => {
          if (extraDutyMutation.isPending) return;
          setExtraDutyOpen(false);
          setExtraDutyForm(initialExtraDutyForm);
          setExtraDutyError("");
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Assign Extra Duty</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="extra-duty-target-label">Assign To</InputLabel>
              <Select
                labelId="extra-duty-target-label"
                label="Assign To"
                name="targetType"
                value={extraDutyForm.targetType}
                onChange={handleExtraDutyFormChange}
              >
                <MenuItem value="team">Entire Team</MenuItem>
                <MenuItem value="employee">Specific Employee</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel id="extra-duty-team-label">Team</InputLabel>
              <Select
                labelId="extra-duty-team-label"
                label="Team"
                name="teamId"
                value={extraDutyForm.teamId}
                onChange={handleExtraDutyFormChange}
              >
                {teams.map((team) => (
                  <MenuItem key={team._id} value={team._id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {extraDutyForm.targetType === "employee" && (
              <FormControl fullWidth required disabled={!extraDutyForm.teamId}>
                <InputLabel id="extra-duty-employee-label">Employee</InputLabel>
                <Select
                  labelId="extra-duty-employee-label"
                  label="Employee"
                  name="employeeId"
                  value={extraDutyForm.employeeId}
                  onChange={handleExtraDutyFormChange}
                >
                  {extraDutyEmployees.map((employee) => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.name}
                      {employee.email ? ` (${employee.email})` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              required
              label="Job Title"
              name="title"
              value={extraDutyForm.title}
              onChange={handleExtraDutyFormChange}
              inputProps={{ maxLength: 150 }}
            />

            <TextField
              fullWidth
              required
              multiline
              minRows={3}
              label="Job Details"
              name="description"
              value={extraDutyForm.description}
              onChange={handleExtraDutyFormChange}
              inputProps={{ maxLength: 1000 }}
            />

            <TextField
              fullWidth
              required
              type="number"
              label="Duration (hours)"
              name="durationHours"
              value={extraDutyForm.durationHours}
              onChange={handleExtraDutyFormChange}
              inputProps={{ min: 1, max: 12, step: 1 }}
            />

            {extraDutyError && <Alert severity="error">{extraDutyError}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              if (extraDutyMutation.isPending) return;
              setExtraDutyOpen(false);
              setExtraDutyForm(initialExtraDutyForm);
              setExtraDutyError("");
            }}
            disabled={extraDutyMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateExtraDuty}
            disabled={
              extraDutyMutation.isPending ||
              teams.length === 0 ||
              (extraDutyForm.targetType === "employee" &&
                extraDutyEmployees.length === 0)
            }
          >
            {extraDutyMutation.isPending ? "Assigning..." : "Assign Extra Duty"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TaskManagement;
