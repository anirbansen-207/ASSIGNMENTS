import { useState } from "react";

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
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  createLeaveApi,
  getMyLeaveBalanceApi,
  getMyLeavesApi,
} from "../../api/leaveApi";

function MyLeave() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    leaveType: "CASUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const {
    data: leaves = [],
    isLoading: leavesLoading,
    isError: leavesError,
    error: leavesErrorData,
  } = useQuery({
    queryKey: ["my-leaves"],
    queryFn: getMyLeavesApi,
  });

  const {
    data: balances = [],
    isLoading: balanceLoading,
    isError: balanceError,
    error: balanceErrorData,
  } = useQuery({
    queryKey: ["my-leave-balance"],
    queryFn: getMyLeaveBalanceApi,
  });

  const createLeaveMutation = useMutation({
    mutationFn: createLeaveApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-leaves"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-leave-balance"],
      });

      setFormData({
        leaveType: "CASUAL",
        startDate: "",
        endDate: "",
        reason: "",
      });
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (formData.endDate < formData.startDate) {
      return;
    }

    createLeaveMutation.mutate(formData);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString();
  };

  const getRemainingDays = (balance) =>
    Number(balance.totalDays || 0) -
    Number(balance.usedDays || 0);

  const dateFieldProps = {
    fullWidth: true,
    type: "date",
    required: true,
    slotProps: {
      inputLabel: {
        shrink: true,
      },
    },
    sx: {
      minWidth: 0,
      "& .MuiInputBase-root": {
        minWidth: 0,
      },
    },
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{ mb: 0.5 }}
      >
        Leave Management
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Apply for leave and view your leave balance and history.
      </Typography>

      {createLeaveMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {createLeaveMutation.error?.response?.data?.message ||
            createLeaveMutation.error?.message ||
            "Failed to submit leave request"}
        </Alert>
      )}

      {createLeaveMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Leave request submitted successfully.
        </Alert>
      )}

      {/* Apply for Leave */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: 1,
          borderColor: "divider",
          boxShadow: 1,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ mb: 2.5 }}
          >
            Apply for Leave
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2} alignItems="flex-start">
              {/* Leave Type and Submit button share the first column. */}
              <Grid item xs={12} sm={4} md={2.5}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    select
                    label="Leave Type"
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="CASUAL">CASUAL</MenuItem>
                    <MenuItem value="SICK">SICK</MenuItem>
                    <MenuItem value="EARNED">EARNED</MenuItem>
                    <MenuItem value="UNPAID">UNPAID</MenuItem>
                  </TextField>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={
                      createLeaveMutation.isPending ||
                      !formData.startDate ||
                      !formData.endDate ||
                      !formData.reason.trim() ||
                      formData.endDate < formData.startDate
                    }
                    sx={{
                      minHeight: 48,
                      whiteSpace: "normal",
                      px: 1,
                    }}
                  >
                    {createLeaveMutation.isPending
                      ? "Submitting..."
                      : "Submit Leave Request"}
                  </Button>
                </Stack>
              </Grid>

              {/* Start Date */}
              <Grid item xs={12} sm={4} md={2.5}>
                <TextField
                  {...dateFieldProps}
                  label="Start Date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  slotProps={{
                    ...dateFieldProps.slotProps,
                    htmlInput: {
                      max: formData.endDate || undefined,
                    },
                  }}
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={12} sm={4} md={2.5}>
                <TextField
                  {...dateFieldProps}
                  label="End Date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  slotProps={{
                    ...dateFieldProps.slotProps,
                    htmlInput: {
                      min: formData.startDate || undefined,
                    },
                  }}
                />
              </Grid>

              {/* Wider Reason field */}
              <Grid item xs={12} md={4.5}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  label="Reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  inputProps={{
                    maxLength: 500,
                  }}
                  helperText={`${formData.reason.length}/500`}
                  required
                  sx={{
                    "& .MuiInputBase-root": {
                      alignItems: "flex-start",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* My Leave Balance */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: 1,
          borderColor: "divider",
          boxShadow: 1,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ mb: 2 }}
          >
            My Leave Balance
          </Typography>

          {balanceLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : balanceError ? (
            <Alert severity="error">
              {balanceErrorData?.response?.data?.message ||
                balanceErrorData?.message ||
                "Failed to load leave balance"}
            </Alert>
          ) : balances.length === 0 ? (
            <Alert severity="info">
              No leave balance has been configured yet.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {balances.map((balance) => (
                <Grid item xs={12} sm={6} md={3} key={balance._id}>
                  <Card
                    variant="outlined"
                    sx={{ height: "100%", borderRadius: 2 }}
                  >
                    <CardContent>
                      <Typography fontWeight={600}>
                        {balance.leaveType}
                      </Typography>

                      <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{ mt: 1 }}
                      >
                        {getRemainingDays(balance)}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Remaining days
                      </Typography>

                      <Divider sx={{ my: 1.5 }} />

                      <Typography variant="body2">
                        Total: {balance.totalDays}
                      </Typography>

                      <Typography variant="body2">
                        Used: {balance.usedDays}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card
        sx={{
          borderRadius: 3,
          border: 1,
          borderColor: "divider",
          boxShadow: 1,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ mb: 2 }}
          >
            Leave History
          </Typography>

          {leavesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : leavesError ? (
            <Alert severity="error">
              {leavesErrorData?.response?.data?.message ||
                leavesErrorData?.message ||
                "Failed to load leave history"}
            </Alert>
          ) : leaves.length === 0 ? (
            <Alert severity="info">
              No leave requests found.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {leaves.map((leave) => (
                <Card
                  key={leave._id}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={2}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography fontWeight={600}>
                          {leave.leaveType}
                        </Typography>

                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {formatDate(leave.startDate)} →{" "}
                          {formatDate(leave.endDate)}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1, overflowWrap: "anywhere" }}
                        >
                          Reason: {leave.reason}
                        </Typography>
                      </Box>

                      <Chip
                        label={leave.status}
                        color={
                          leave.status === "APPROVED"
                            ? "success"
                            : leave.status === "REJECTED"
                              ? "error"
                              : "default"
                        }
                        variant="outlined"
                      />
                    </Stack>

                    {leave.rejectionReason && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        Rejection reason: {leave.rejectionReason}
                      </Alert>
                    )}

                    {leave.managerId && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Manager: {leave.managerId.name}
                      </Typography>
                    )}
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

export default MyLeave;