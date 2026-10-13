
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
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
import { getAllTeamsApi } from "../../api/teamApi";
import { getAllExtraWorkRecordsApi } from "../../api/attendanceApi";

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (minutes) => {
  const total = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(total / 60);
  const remaining = total % 60;

  if (hours && remaining) return `${hours}h ${remaining}m`;
  if (hours) return `${hours}h`;

  return `${remaining}m`;
};

const statusColor = (status) => {
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return "success";
    case "REJECTED":
    case "EXPIRED":
      return "error";
    case "PENDING":
      return "warning";
    default:
      return "default";
  }
};

function ExtraWorkAudit() {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    teamId: "",
    managerId: "",
    status: "",
  });

  const teamsQuery = useQuery({
    queryKey: ["extra-work-audit-teams"],
    queryFn: getAllTeamsApi,
  });

  const recordsQuery = useQuery({
    queryKey: ["all-extra-work-records", filters],
    queryFn: () => getAllExtraWorkRecordsApi(filters),
  });

  const teams = Array.isArray(teamsQuery.data)
    ? teamsQuery.data
    : [];

  const records = Array.isArray(recordsQuery.data)
    ? recordsQuery.data
    : [];

  const managers = [
    ...new Map(
      teams
        .map((team) => {
          const manager = team.managerId;

          if (!manager || typeof manager !== "object") return null;

          return [
            manager._id,
            {
              _id: manager._id,
              name: manager.name,
            },
          ];
        })
        .filter(Boolean),
    ).values(),
  ];

  const updateFilter = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  return (
    <Box sx={{ width: "100%", pb: 3 }}>
      <Typography
        variant="h4"
        fontWeight={750}
        sx={{ mb: 1 }}
      >
        Extra-Work Audit
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Review extra-work requests, manager decisions, and actual
        extra time across the organization.
      </Typography>

      <Card
        variant="outlined"
        sx={{ mb: 3, borderRadius: 3 }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Filters
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <TextField
              type="date"
              label="Requested From"
              value={filters.from}
              onChange={(event) => updateFilter("from", event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />

            <TextField
              type="date"
              label="Requested To"
              value={filters.to}
              onChange={(event) => updateFilter("to", event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="audit-status-label">Status</InputLabel>
              <Select
                labelId="audit-status-label"
                label="Status"
                value={filters.status}
                onChange={(event) => updateFilter("status", event.target.value)}
              >
                <MenuItem value="">All statuses</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="EXPIRED">Expired</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="audit-team-label">Team</InputLabel>
              <Select
                labelId="audit-team-label"
                label="Team"
                value={filters.teamId}
                onChange={(event) => updateFilter("teamId", event.target.value)}
              >
                <MenuItem value="">All teams</MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team._id} value={team._id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="audit-manager-label">Manager</InputLabel>
              <Select
                labelId="audit-manager-label"
                label="Manager"
                value={filters.managerId}
                onChange={(event) =>
                  updateFilter("managerId", event.target.value)
                }
              >
                <MenuItem value="">All managers</MenuItem>
                {managers.map((manager) => (
                  <MenuItem key={manager._id} value={manager._id}>
                    {manager.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" fontWeight={700}>
              Extra-Work Records
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {records.length} records
            </Typography>
          </Stack>

          {recordsQuery.isLoading || teamsQuery.isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : recordsQuery.isError ? (
            <Alert severity="error">
              {recordsQuery.error?.response?.data?.message ||
                recordsQuery.error?.message ||
                "Could not load extra-work records."}
            </Alert>
          ) : teamsQuery.isError ? (
            <Alert severity="warning">
              Team filter options could not be loaded.
            </Alert>
          ) : records.length === 0 ? (
            <Alert severity="info">
              No extra-work records match these filters.
            </Alert>
          ) : (
            <TableContainer sx={{ maxWidth: "100%" }}>
              <Table size="small" sx={{ minWidth: 1550 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: "action.hover",
                      "& th": {
                        fontWeight: 750,
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <TableCell>Employee</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell>Team Manager</TableCell>
                    <TableCell>Requested At</TableCell>
                    <TableCell>Employee Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Decision By</TableCell>
                    <TableCell>Decision Time</TableCell>
                    <TableCell>Manager Decision Note</TableCell>
                    <TableCell>Started At</TableCell>
                    <TableCell>Scheduled End</TableCell>
                    <TableCell>Actual End</TableCell>
                    <TableCell>Approved Duration</TableCell>
                    <TableCell>Actual Extra Time</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record._id} hover>
                      <TableCell sx={{ minWidth: 180 }}>
                        <Typography fontWeight={650}>
                          {record.employeeId?.name || "—"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.employeeId?.email || ""}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {record.teamId?.name || "—"}
                      </TableCell>

                      <TableCell>
                        {record.teamId?.managerId?.name || "—"}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDateTime(record.requestedAt)}
                      </TableCell>

                      <TableCell sx={{ minWidth: 220, whiteSpace: "normal" }}>
                        {record.employeeReason || "—"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          color={statusColor(record.status)}
                          label={record.status || "—"}
                        />
                      </TableCell>

                      <TableCell sx={{ minWidth: 150 }}>
                        {record.approvedBy?.name || "Not decided"}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDateTime(record.decisionAt)}
                      </TableCell>

                      <TableCell sx={{ minWidth: 220, whiteSpace: "normal" }}>
                        {record.managerReason || "—"}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDateTime(record.actualStartAt)}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDateTime(record.approvedEndAt)}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDateTime(record.actualEndAt)}
                        {record.autoCheckedOut && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            Automatic checkout
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {record.approvedDurationMinutes == null
                          ? "—"
                          : formatDuration(record.approvedDurationMinutes)}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDuration(record.actualExtraMinutes)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default ExtraWorkAudit;
