
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import HistoryIcon from "@mui/icons-material/History";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

import { getAdminActivityApi } from "../../api/adminActivityApi";
import { getAllTeamsApi } from "../../api/teamApi";
import { getDepartmentsApi } from "../../api/departmentApi";

const ACTIVITY_TYPES = [
  ["TASK_CREATED", "Task created"],
  ["TASK_ACCEPTED", "Task accepted"],
  ["TASK_STATUS_CHANGED", "Task status changed"],
  ["TASK_PROGRESS_UPDATED", "Task progress updated"],
  ["TASK_UPDATED", "Task updated"],
  ["TASK_DELETED", "Task deleted"],
  ["LEAVE_REQUESTED", "Leave requested"],
  ["LEAVE_APPROVED", "Leave approved"],
  ["LEAVE_REJECTED", "Leave rejected"],
  ["ATTENDANCE_CHECKED_IN", "Checked in"],
  ["ATTENDANCE_LATE", "Late check-in"],
  ["ATTENDANCE_CHECKED_OUT", "Checked out"],
  ["ATTENDANCE_BREAK_STARTED", "Break started"],
  ["ATTENDANCE_BREAK_ENDED", "Break ended"],
  ["ATTENDANCE_CORRECTED", "Attendance corrected"],
];

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
};

const titleCase = (value = "") =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

function AdminActivityFeed() {
  const [filters, setFilters] = useState({
    actorRole: "",
    teamId: "",
    departmentId: "",
    type: "",
  });

  const teamsQuery = useQuery({
    queryKey: ["admin-activity-teams"],
    queryFn: getAllTeamsApi,
  });

  const departmentsQuery = useQuery({
    queryKey: ["admin-activity-departments"],
    queryFn: getDepartmentsApi,
  });

  const activityQuery = useQuery({
    queryKey: ["admin-activity-feed", filters],
    queryFn: () => getAdminActivityApi(filters),
    refetchInterval: 30000,
  });

  const teams = useMemo(
    () => (
      Array.isArray(teamsQuery.data)
        ? teamsQuery.data
        : []
    ),
    [teamsQuery.data],
  );

  const departments = useMemo(
    () => (
      Array.isArray(departmentsQuery.data)
        ? departmentsQuery.data
        : []
    ),
    [departmentsQuery.data],
  );

  const activities = Array.isArray(activityQuery.data)
    ? activityQuery.data
    : [];

  const updateFilter = (key) => (event) => {
    setFilters((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      actorRole: "",
      teamId: "",
      departmentId: "",
      type: "",
    });
  };

  if (activityQuery.isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 5,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (activityQuery.isError) {
    return (
      <Alert severity="error">
        {activityQuery.error?.response?.data?.message ||
          activityQuery.error?.message ||
          "Failed to load admin activity."}
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
            <HistoryIcon />
            <Typography variant="h4" fontWeight={700}>
              Admin Activity Feed
            </Typography>
          </Stack>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Track manager and employee activity across WorkTrack.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<FilterAltOffIcon />}
          onClick={clearFilters}
        >
          Clear filters
        </Button>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel id="activity-role-label">
                Actor role
              </InputLabel>
              <Select
                labelId="activity-role-label"
                value={filters.actorRole}
                label="Actor role"
                onChange={updateFilter("actorRole")}
              >
                <MenuItem value="">All roles</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="activity-team-label">
                Team
              </InputLabel>
              <Select
                labelId="activity-team-label"
                value={filters.teamId}
                label="Team"
                onChange={updateFilter("teamId")}
              >
                <MenuItem value="">All teams</MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team._id} value={team._id}>
                    {team.name || team.teamName || "Unnamed team"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="activity-department-label">
                Department
              </InputLabel>
              <Select
                labelId="activity-department-label"
                value={filters.departmentId}
                label="Department"
                onChange={updateFilter("departmentId")}
              >
                <MenuItem value="">All departments</MenuItem>
                {departments.map((department) => (
                  <MenuItem
                    key={department._id}
                    value={department._id}
                  >
                    {department.name ||
                      department.departmentName ||
                      "Unnamed department"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="activity-type-label">
                Activity type
              </InputLabel>
              <Select
                labelId="activity-type-label"
                value={filters.type}
                label="Activity type"
                onChange={updateFilter("type")}
              >
                <MenuItem value="">All activity types</MenuItem>
                {ACTIVITY_TYPES.map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        <Typography color="text.secondary" variant="body2">
          Showing {activities.length} activity record
          {activities.length === 1 ? "" : "s"}. The feed refreshes
          every 30 seconds.
        </Typography>

        {activities.length === 0 ? (
          <Card>
            <CardContent>
              <Typography
                color="text.secondary"
                textAlign="center"
                sx={{ py: 3 }}
              >
                No activity matches these filters yet.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          activities.map((activity) => (
            <Card key={activity._id} variant="outlined">
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{
                    xs: "flex-start",
                    sm: "center",
                  }}
                  spacing={1}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={700}>
                      {activity.title || titleCase(activity.type)}
                    </Typography>

                    <Typography
                      sx={{ mt: 0.5, overflowWrap: "anywhere" }}
                    >
                      {activity.message}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {formatDateTime(activity.createdAt)}
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ flexShrink: 0 }}
                  >
                    <Chip
                      size="small"
                      label={titleCase(activity.actorRole)}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={titleCase(activity.type)}
                    />
                  </Stack>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{ mt: 1.5 }}
                >
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Team: ${activity.teamId?.name || "Unassigned"}`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Department: ${
                      activity.departmentId?.name || "Unassigned"
                    }`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`By: ${activity.actorName || "Unknown user"}`}
                  />
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
}

export default AdminActivityFeed;
