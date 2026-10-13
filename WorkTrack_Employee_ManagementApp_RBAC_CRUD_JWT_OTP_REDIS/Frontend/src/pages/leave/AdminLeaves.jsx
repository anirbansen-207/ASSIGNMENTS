
import { useEffect, useState } from "react";

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
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { toast } from "sonner";

import { getDepartmentsApi } from "../../api/departmentApi";

import {
  getAllLeavesApi,
  getLeaveCalendarApi,
  setLeaveBalanceApi,
} from "../../api/leaveApi";

const LEAVE_TYPES = ["CASUAL", "SICK", "EARNED", "UNPAID"];

const createEmptyLeaveTypes = () =>
  LEAVE_TYPES.map((leaveType) => ({
    leaveType,
    totalDays: "0",
  }));

function AdminLeaves() {
  const queryClient = useQueryClient();

  const [departmentId, setDepartmentId] = useState("");
  const [leaveTypes, setLeaveTypes] = useState(
    createEmptyLeaveTypes(),
  );

  const {
    data: departments = [],
    isLoading: departmentsLoading,
    isError: departmentsError,
    error: departmentsErrorDetails,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartmentsApi,
  });

  const {
    data: leaves = [],
    isLoading: leavesLoading,
    isError: leavesError,
  } = useQuery({
    queryKey: ["all-leaves"],
    queryFn: getAllLeavesApi,
  });

  const {
    data: calendarLeaves = [],
    isLoading: calendarLoading,
    isError: calendarError,
  } = useQuery({
    queryKey: ["leave-calendar"],
    queryFn: getLeaveCalendarApi,
  });

  // Load the saved policy when a department is selected.
  // Load the saved policy when a department is selected.
  useEffect(() => {
    if (!departmentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLeaveTypes(createEmptyLeaveTypes());
      return;
    }

    const department = departments.find(
      (item) => item._id === departmentId,
    );

    const savedPolicy = department?.leavePolicy;

    if (!savedPolicy || !Array.isArray(savedPolicy.leaveTypes)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLeaveTypes(createEmptyLeaveTypes());
      return;
    }

    const savedTypes = new Map(
      savedPolicy.leaveTypes.map((item) => [
        item.leaveType,
        String(item.totalDays ?? 0),
      ]),
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeaveTypes(
      LEAVE_TYPES.map((leaveType) => ({
        leaveType,
        totalDays: savedTypes.get(leaveType) ?? "0",
      })),
    );
  }, [departmentId, departments]);

  const policyMutation = useMutation({
    mutationFn: setLeaveBalanceApi,

    onSuccess: async () => {
      toast.success("Department leave policy saved successfully.");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["departments"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["all-leaves"],
        }),
      ]);
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save department leave policy.",
      );
    },
  });

  // Preserve the input as a string so the user can temporarily clear it.
  const handleLeaveDaysChange = (leaveType, value) => {
    setLeaveTypes((previous) =>
      previous.map((item) =>
        item.leaveType === leaveType
          ? { ...item, totalDays: value }
          : item,
      ),
    );
  };

  const handlePolicySubmit = (event) => {
    event.preventDefault();

    if (!departmentId) {
      toast.error("Please select a department.");
      return;
    }

    // Convert strings to numbers only when submitting the form.
    const normalizedLeaveTypes = leaveTypes.map((item) => ({
      leaveType: item.leaveType,
      totalDays:
        item.totalDays.trim() === ""
          ? NaN
          : Number(item.totalDays),
    }));

    const invalidAllowance = normalizedLeaveTypes.some(
      (item) =>
        !Number.isFinite(item.totalDays) ||
        item.totalDays < 0,
    );

    if (invalidAllowance) {
      toast.error(
        "Enter a valid non-negative number for every leave type.",
      );
      return;
    }

    policyMutation.mutate({
      departmentId,
      leaveTypes: normalizedLeaveTypes,
    });
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString();
  };

  const getEmployeeName = (leave) =>
    leave.employeeId?.name || "Employee";

  const getEmployeeEmail = (leave) =>
    leave.employeeId?.email || "";

  return (
    <Box>
      <Typography variant="h4" fontWeight={700}>
        Admin Leave Management
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Configure leave allowances by department and review leave
        requests and approved leave records.
      </Typography>

      {departmentsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {departmentsErrorDetails?.response?.data?.message ||
            departmentsErrorDetails?.message ||
            "Failed to load departments."}
        </Alert>
      )}

      {/* Department-level leave policy configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            Department Leave Policy
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Set the annual allowance for each leave type. The policy
            applies to employees in the selected department.
          </Typography>

          <Box component="form" onSubmit={handlePolicySubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Department"
                  value={departmentId}
                  onChange={(event) =>
                    setDepartmentId(event.target.value)
                  }
                  disabled={departmentsLoading}
                  required
                >
                  <MenuItem value="">
                    Select Department
                  </MenuItem>

                  {departments.map((department) => (
                    <MenuItem
                      key={department._id}
                      value={department._id}
                    >
                      {department.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {departmentsLoading ? (
                <Grid item xs={12}>
                  <CircularProgress size={24} />
                </Grid>
              ) : (
                leaveTypes.map((item) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    key={item.leaveType}
                  >
                    <TextField
                      fullWidth
                      type="number"
                      label={`${item.leaveType} leave (days)`}
                      value={item.totalDays}
                      onChange={(event) =>
                        handleLeaveDaysChange(
                          item.leaveType,
                          event.target.value,
                        )
                      }
                      inputProps={{
                        min: 0,
                        step: 0.5,
                      }}
                      helperText={
                        item.leaveType === "UNPAID"
                          ? "Allowance is not enforced by the current service."
                          : "Annual allowance"
                      }
                      required
                    />
                  </Grid>
                ))
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    policyMutation.isPending ||
                    departmentsLoading ||
                    !departmentId
                  }
                >
                  {policyMutation.isPending
                    ? "Saving Policy..."
                    : "Save Department Policy"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* All leave requests */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            All Leave Requests
          </Typography>

          {leavesLoading ? (
            <CircularProgress />
          ) : leavesError ? (
            <Alert severity="error">
              Failed to load leave requests.
            </Alert>
          ) : leaves.length === 0 ? (
            <Alert severity="info">
              No leave requests found.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {leaves.map((leave) => (
                <Card key={leave._id} variant="outlined">
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box>
                        <Typography fontWeight={600}>
                          {getEmployeeName(leave)}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {getEmployeeEmail(leave)}
                        </Typography>

                        <Typography sx={{ mt: 1 }}>
                          {leave.leaveType}
                        </Typography>

                        <Typography variant="body2">
                          {formatDate(leave.startDate)} →{" "}
                          {formatDate(leave.endDate)}
                        </Typography>

                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Days: {leave.totalDays}
                        </Typography>

                        {leave.reason && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Reason: {leave.reason}
                          </Typography>
                        )}
                      </Box>

                      <Chip
                        label={leave.status || "UNKNOWN"}
                        color={
                          leave.status === "APPROVED"
                            ? "success"
                            : leave.status === "REJECTED"
                              ? "error"
                              : "default"
                        }
                      />
                    </Stack>

                    {leave.rejectionReason && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {leave.rejectionReason}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Approved leave calendar */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Approved Leave Calendar
          </Typography>

          {calendarLoading ? (
            <CircularProgress />
          ) : calendarError ? (
            <Alert severity="error">
              Failed to load approved leave records.
            </Alert>
          ) : calendarLeaves.length === 0 ? (
            <Alert severity="info">
              No approved leaves found.
            </Alert>
          ) : (
            <Stack spacing={1.5}>
              {calendarLeaves.map((leave) => (
                <Card key={leave._id} variant="outlined">
                  <CardContent>
                    <Typography fontWeight={600}>
                      {getEmployeeName(leave)}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {getEmployeeEmail(leave)}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      {leave.leaveType} — {leave.totalDays} day(s)
                    </Typography>

                    <Typography variant="body2">
                      {formatDate(leave.startDate)} →{" "}
                      {formatDate(leave.endDate)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdminLeaves;
