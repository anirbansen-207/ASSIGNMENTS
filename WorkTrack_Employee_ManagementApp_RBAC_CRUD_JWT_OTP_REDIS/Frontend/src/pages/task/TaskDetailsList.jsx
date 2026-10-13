import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
  LinearProgress,
} from "@mui/material";

import { Refresh } from "@mui/icons-material";

import { getAllTasksApi, getMyTasksApi } from "../../api/taskApi";
import useAuth from "../../hooks/useAuth";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
};

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

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

const getPersonName = (person) => {
  if (!person) return "—";

  if (typeof person === "string") return person;

  return person.name || "—";
};

const getDesignation = (person) => {
  if (!person || typeof person !== "object") return "";

  return person.designation || "";
};

function PersonCell({ person }) {
  const name = getPersonName(person);
  const designation = getDesignation(person);

  return (
    <Box sx={{ minWidth: 130 }}>
      <Typography variant="body2" fontWeight={600}>
        {name}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 0.25 }}
      >
        {designation ? `(${designation})` : "(Designation not set)"}
      </Typography>
    </Box>
  );
}

export default function TaskDetailsList() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isEmployee = user?.role === "employee";

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["task-details-list", user?.role],
    queryFn: isEmployee ? getMyTasksApi : getAllTasksApi,
    enabled: Boolean(user?.role),
  });

  const safeTasks = Array.isArray(tasks)
    ? tasks.filter((task) => task && task._id)
    : [];

  const filteredTasks = useMemo(() => {
    return safeTasks.filter((task) => {
      // Filter by task start date.
      const taskDate = task.startDate
        ? new Date(task.startDate).toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          })
        : "";

      if (startDate && (!taskDate || taskDate < startDate)) {
        return false;
      }

      if (endDate && (!taskDate || taskDate > endDate)) {
        return false;
      }

      return true;
    });
  }, [safeTasks, startDate, endDate]);

  const openTask = (taskId) => {
    if (user?.role === "admin") {
      navigate(`/admin/tasks/${taskId}`);
    } else if (user?.role === "manager") {
      navigate(`/manager/tasks/${taskId}`);
    } else {
      navigate(`/employee/my-tasks/${taskId}`);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error?.response?.data?.message ||
          error?.message ||
          "Unable to load task details."}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Task Details
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            View task assignments, ownership, deadlines and completion status.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Refresh
        </Button>
      </Stack>

      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 2, borderRadius: 2 }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Filter by Task Start Date
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            label="From Date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: {
                max: endDate || undefined,
              },
            }}
            sx={{ width: { xs: "100%", sm: 220 } }}
          />

          <TextField
            label="To Date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: {
                min: startDate || undefined,
              },
            }}
            sx={{ width: { xs: "100%", sm: 220 } }}
          />

          <Button
            variant="text"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
          >
            Clear Filters
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: { sm: "auto !important" } }}
          >
            {filteredTasks.length} task(s)
          </Typography>
        </Stack>
      </Paper>

      {filteredTasks.length === 0 ? (
        <Alert severity="info">
          No tasks found for the selected date range.
        </Alert>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            maxHeight: "70vh",
            overflow: "auto",
            borderRadius: 2,
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              minWidth: 1250,
              "& .MuiTableCell-root": {
                verticalAlign: "top",
                py: 1.75,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 200 }}>
                  Task Name
                </TableCell>

                <TableCell sx={{ minWidth: 250 }}>
                  Task Details
                </TableCell>

                <TableCell sx={{ minWidth: 180 }}>
                  Assigned By
                </TableCell>

                <TableCell sx={{ minWidth: 180 }}>
                  Assigned To
                </TableCell>

                <TableCell sx={{ minWidth: 150 }}>
                  Team
                </TableCell>

                <TableCell sx={{ minWidth: 160 }}>
                  Department
                </TableCell>

                <TableCell sx={{ minWidth: 230 }}>
                  Completion Report
                </TableCell>

                <TableCell sx={{ minWidth: 130 }}>
                  Start Date
                </TableCell>

                <TableCell sx={{ minWidth: 130 }}>
                  Due Date
                </TableCell>

                <TableCell sx={{ minWidth: 130 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow
                  hover
                  key={task._id}
                >
                  <TableCell>
                    <Typography fontWeight={600}>
                      {task.title || "Untitled Task"}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Priority: {task.priority || "—"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {task.description || "No task details provided."}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <PersonCell person={task.assignedBy} />
                  </TableCell>

                  <TableCell>
                    <PersonCell person={task.assignedTo} />
                  </TableCell>

                  <TableCell>
                    {task.teamId?.name || "—"}
                  </TableCell>

                  <TableCell>
                    {task.departmentId?.name || "—"}
                  </TableCell>

                  <TableCell>
                    <Stack spacing={1}>
                      <Chip
                        size="small"
                        label={formatStatus(task.status)}
                        color={getStatusColor(task.status)}
                        sx={{ alignSelf: "flex-start" }}
                      />

                      <Box>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Typography variant="caption">
                            Progress
                          </Typography>

                          <Typography variant="caption" fontWeight={600}>
                            {Number(task.progress || 0)}%
                          </Typography>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={Math.min(
                            100,
                            Math.max(0, Number(task.progress || 0)),
                          )}
                          sx={{ mt: 0.5, borderRadius: 1 }}
                        />
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        Actual hours: {task.actualHours ?? 0}
                      </Typography>

                      {task.completedAt && (
                        <Typography variant="caption" color="text.secondary">
                          Completed: {formatDate(task.completedAt)}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    {formatDate(task.startDate)}
                  </TableCell>

                  <TableCell>
                    {formatDate(task.dueDate)}
                  </TableCell>

                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openTask(task._id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}