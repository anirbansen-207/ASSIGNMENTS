
import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  Analytics as AnalyticsIcon,
  Assignment,
  Business,
  EventAvailable,
  EventBusy,
  Groups,
  PendingActions,
  TaskAlt,
  TrendingUp,
} from "@mui/icons-material";

import { getAnalyticsOverviewApi } from "../../api/analyticsApi";

// Reusable colors keep the same visual design across every role.
const cardColors = {
  blue: {
    color: "#1976D2",
    background: "#EAF3FF",
  },
  green: {
    color: "#2E7D32",
    background: "#EAF6ED",
  },
  orange: {
    color: "#ED6C02",
    background: "#FFF3E5",
  },
  red: {
    color: "#D32F2F",
    background: "#FDECEC",
  },
  purple: {
    color: "#7B1FA2",
    background: "#F4EAFE",
  },
  grey: {
    color: "#546E7A",
    background: "#EEF2F4",
  },
};

function Analytics() {
  // The backend returns analytics based on the logged-in user's role.
  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: getAnalyticsOverviewApi,

    // Refresh analytics every 10 seconds while the page is active.
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  // Use the backend's average saved task progress.
  // This is different from the percentage of tasks marked COMPLETED.
  const taskCompletionPercentage = useMemo(() => {
    const progress = Number(analytics?.tasks?.averageProgress);

    if (!Number.isFinite(progress)) {
      return 0;
    }

    return Math.min(100, Math.max(0, Math.round(progress)));
  }, [analytics]);

  const role = analytics?.role || "user";

  const roleLabel =
    role.charAt(0).toUpperCase() + role.slice(1);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 320,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">
          Loading analytics...
        </Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          <Chip
            label={isFetching ? "Retrying..." : "Retry"}
            clickable={!isFetching}
            onClick={() => refetch()}
            disabled={isFetching}
            size="small"
          />
        }
      >
        {error?.response?.data?.message ||
          error?.message ||
          "Failed to load analytics."}
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="info">
        No analytics data is available.
      </Alert>
    );
  }

  const tasks = analytics.tasks;
  const attendance = analytics.attendance;
  const leave = analytics.leave;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1600,
        mx: "auto",
      }}
    >
      {/* Page heading */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                color: "primary.main",
                backgroundColor: "#EAF3FF",
              }}
            >
              <AnalyticsIcon />
            </Box>

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                fontSize: {
                  xs: "1.65rem",
                  sm: "2rem",
                },
              }}
            >
              Analytics
            </Typography>
          </Stack>

          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Track tasks, attendance, and leave at a glance.
          </Typography>
        </Box>

        <Chip
          label={`${roleLabel} Overview`}
          color="primary"
          variant="outlined"
          sx={{
            fontWeight: 600,
            borderRadius: 2,
          }}
        />
      </Stack>

      {/* Organization statistics are visible to admins only. */}
      {role === "admin" &&
        analytics.users &&
        analytics.organization && (
          <Box sx={{ mb: 4 }}>
            <SectionHeading
              title="Organization Overview"
              subtitle="A snapshot of your organization."
              icon={<Business />}
            />

            <Grid container spacing={2}>
              <StatCard
                title="Employees"
                value={analytics.users.totalEmployees}
                icon={<Groups />}
                tone="blue"
              />

              <StatCard
                title="Managers"
                value={analytics.users.totalManagers}
                icon={<Groups />}
                tone="purple"
              />

              <StatCard
                title="Departments"
                value={analytics.organization.totalDepartments}
                icon={<Business />}
                tone="green"
              />

              <StatCard
                title="Teams"
                value={analytics.organization.totalTeams}
                icon={<Groups />}
                tone="orange"
              />
            </Grid>
          </Box>
        )}

      {/* Team statistics are visible to managers only. */}
      {role === "manager" && analytics.team && (
        <Box sx={{ mb: 4 }}>
          <SectionHeading
            title="Team Overview"
            subtitle="An overview of your assigned team."
            icon={<Groups />}
          />

          <Grid container spacing={2}>
            <StatCard
              title="Teams"
              value={analytics.team.totalTeams}
              icon={<Groups />}
              tone="blue"
            />

            <StatCard
              title="Employees"
              value={analytics.team.totalEmployees}
              icon={<Groups />}
              tone="green"
            />
          </Grid>
        </Box>
      )}

      {/* Task metrics use the same layout for all roles. */}
      {tasks && (
        <Box sx={{ mb: 4 }}>
          <SectionHeading
            title="Task Overview"
            subtitle="Understand workload and completion at a glance."
            icon={<Assignment />}
          />

          <Grid container spacing={2}>
            <StatCard
              title="Total Tasks"
              value={tasks.total}
              icon={<Assignment />}
              tone="blue"
            />

            <StatCard
              title="Completed"
              value={tasks.completed}
              icon={<TaskAlt />}
              tone="green"
            />

            <StatCard
              title="In Progress"
              value={tasks.inProgress}
              icon={<TrendingUp />}
              tone="purple"
            />

            <StatCard
              title="Pending"
              value={tasks.pending}
              icon={<PendingActions />}
              tone="orange"
            />

            <StatCard
              title="Blocked"
              value={tasks.blocked}
              icon={<EventBusy />}
              tone="red"
            />
          </Grid>

          {/* Task completion card */}
          <Card
            variant="outlined"
            sx={{
              mt: 2,
              borderColor: "divider",
              borderRadius: 3,
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.035)",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={1}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Task Completion
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Average progress across your assigned tasks.
                  </Typography>
                </Box>

                <Typography
                  variant="h4"
                  fontWeight={700}
                  color="primary.main"
                >
                  {taskCompletionPercentage}%
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={taskCompletionPercentage}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#E7EEF7",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 5,
                  },
                }}
              />

              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mt: 1 }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {Number(tasks.completed) || 0} completed
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {Number(tasks.total) || 0} total tasks
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Attendance statistics */}
      {attendance && (
        <Box sx={{ mb: 4 }}>
          <SectionHeading
            title="Attendance Overview"
            subtitle="Monitor recorded attendance statuses."
            icon={<EventAvailable />}
          />

          <Grid container spacing={2}>
            <StatCard
              title="Present"
              value={attendance.present}
              icon={<EventAvailable />}
              tone="green"
            />

            <StatCard
              title="Late"
              value={attendance.late}
              icon={<EventAvailable />}
              tone="orange"
            />

            <StatCard
              title="Half Day"
              value={attendance.halfDay}
              icon={<EventAvailable />}
              tone="purple"
            />

            <StatCard
              title="Absent"
              value={attendance.absent}
              icon={<EventBusy />}
              tone="red"
            />

            <StatCard
              title="On Leave"
              value={attendance.onLeave}
              icon={<EventBusy />}
              tone="blue"
            />
          </Grid>
        </Box>
      )}

      {/* Leave statistics */}
      {leave && (
        <Box sx={{ mb: 2 }}>
          <SectionHeading
            title="Leave Overview"
            subtitle="Review leave requests by their current status."
            icon={<EventAvailable />}
          />

          <Grid container spacing={2}>
            <StatCard
              title="Pending"
              value={leave.pending}
              icon={<PendingActions />}
              tone="orange"
            />

            <StatCard
              title="Approved"
              value={leave.approved}
              icon={<TaskAlt />}
              tone="green"
            />

            <StatCard
              title="Rejected"
              value={leave.rejected}
              icon={<EventBusy />}
              tone="red"
            />
          </Grid>
        </Box>
      )}
    </Box>
  );
}

/*
 * Reusable section heading.
 * This keeps the visual hierarchy consistent across roles.
 */
function SectionHeading({
  title,
  subtitle,
  icon,
}) {
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      spacing={1.5}
      sx={{ mb: 2 }}
    >
      <Box
        sx={{
          mt: 0.25,
          color: "primary.main",
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          variant="h6"
          fontWeight={700}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.25 }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
}

/*
 * Reusable statistic card.
 * The same component styles every KPI consistently.
 */
function StatCard({
  title,
  value,
  icon,
  tone = "blue",
}) {
  const colors = cardColors[tone] || cardColors.blue;

  return (
    <Grid
      size={{
        xs: 12,
        sm: 6,
        md: 4,
        lg: 3,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          borderRadius: 3,
          borderColor: "divider",
          backgroundColor: "#FFFFFF",
          transition: "border-color 160ms ease, box-shadow 160ms ease",
          "&:hover": {
            borderColor: colors.color,
            boxShadow: "0 5px 18px rgba(15, 23, 42, 0.07)",
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
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                {title}
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                  mt: 1,
                  color: "text.primary",
                  lineHeight: 1.2,
                  fontSize: {
                    xs: "1.8rem",
                    sm: "2rem",
                  },
                }}
              >
                {value ?? 0}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: 2.5,
                color: colors.color,
                backgroundColor: colors.background,
                "& svg": {
                  fontSize: 26,
                },
              }}
            >
              {icon}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default Analytics;
