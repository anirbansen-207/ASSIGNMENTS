import {
  useState,
} from "react";

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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  getTeamLeavesApi,
  reviewLeaveApi,
} from "../../api/leaveApi";

function TeamLeaves() {
  const queryClient =
    useQueryClient();

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedLeave, setSelectedLeave] =
    useState(null);

  const [reviewForm, setReviewForm] =
    useState({
      status: "APPROVED",
      rejectionReason: "",
    });

  // Manager sees only leave requests
  // assigned to that manager by the backend.
  const {
    data: leaves = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "team-leaves",
    ],
    queryFn:
      getTeamLeavesApi,
  });

  const reviewMutation =
    useMutation({
      mutationFn: ({
        leaveId,
        data,
      }) =>
        reviewLeaveApi(
          leaveId,
          data,
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "team-leaves",
          ],
        });

        setOpenDialog(false);
        setSelectedLeave(null);
      },
    });

  const formatDate = (
    date,
  ) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date,
    ).toLocaleDateString();
  };

  const openReviewDialog = (
    leave,
  ) => {
    setSelectedLeave(
      leave,
    );

    setReviewForm({
      status: "APPROVED",
      rejectionReason: "",
    });

    setOpenDialog(true);
  };

  const handleReview = () => {
    if (
      !selectedLeave
    ) {
      return;
    }

    const data = {
      status:
        reviewForm.status,
    };

    // Backend requires a rejection reason
    // whenever the manager rejects a leave.
    if (
      reviewForm.status ===
      "REJECTED"
    ) {
      data.rejectionReason =
        reviewForm.rejectionReason;
    }

    reviewMutation.mutate({
      leaveId:
        selectedLeave._id,
      data,
    });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "center",
          mt: 5,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error?.response?.data
          ?.message ||
          error?.message ||
          "Failed to load team leaves"}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        fontWeight={700}
      >
        Team Leave Requests
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mb: 3,
        }}
      >
        Review leave requests
        submitted by your team
        members.
      </Typography>

      {reviewMutation.isError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
        >
          {reviewMutation.error
            ?.response?.data
            ?.message ||
            reviewMutation.error
              ?.message ||
            "Failed to review leave"}
        </Alert>
      )}

      {leaves.length ===
      0 ? (
        <Alert severity="info">
          No leave requests found.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {leaves.map(
            (leave) => (
              <Card
                key={
                  leave._id
                }
                variant="outlined"
              >
                <CardContent>
                  <Stack
                    direction={{
                      xs: "column",
                      md: "row",
                    }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                      >
                        {
                          leave
                            .employeeId
                            ?.name
                        }
                      </Typography>

                      <Typography
                        color="text.secondary"
                      >
                        {
                          leave
                            .employeeId
                            ?.email
                        }
                      </Typography>

                      <Typography
                        sx={{
                          mt: 1,
                        }}
                      >
                        {
                          leave.leaveType
                        }
                      </Typography>

                      <Typography
                        variant="body2"
                      >
                        {
                          formatDate(
                            leave.startDate,
                          )
                        }{" "}
                        →{" "}
                        {
                          formatDate(
                            leave.endDate,
                          )
                        }
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                        }}
                      >
                        Total Days:{" "}
                        {
                          leave.totalDays
                        }
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                        }}
                      >
                        Reason:{" "}
                        {
                          leave.reason
                        }
                      </Typography>
                    </Box>

                    <Stack
                      spacing={1}
                      alignItems={{
                        xs: "flex-start",
                        md: "flex-end",
                      }}
                    >
                      <Chip
                        label={
                          leave.status
                        }
                      />

                      {leave.status ===
                        "PENDING" && (
                        <Button
                          variant="contained"
                          onClick={() =>
                            openReviewDialog(
                              leave,
                            )
                          }
                        >
                          Review
                        </Button>
                      )}
                    </Stack>
                  </Stack>

                  {leave.rejectionReason && (
                    <Alert
                      severity="error"
                      sx={{
                        mt: 2,
                      }}
                    >
                      Rejection reason:{" "}
                      {
                        leave.rejectionReason
                      }
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ),
          )}
        </Stack>
      )}

      {/* Manager review dialog */}
      <Dialog
        open={openDialog}
        onClose={() =>
          setOpenDialog(
            false,
          )
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Review Leave Request
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{
              mt: 1,
            }}
          >
            <TextField
              select
              fullWidth
              label="Decision"
              value={
                reviewForm.status
              }
              onChange={(event) =>
                setReviewForm(
                  (previous) => ({
                    ...previous,
                    status:
                      event.target
                        .value,
                  }),
                )
              }
            >
              <MenuItem value="APPROVED">
                APPROVE
              </MenuItem>

              <MenuItem value="REJECTED">
                REJECT
              </MenuItem>
            </TextField>

            {reviewForm.status ===
              "REJECTED" && (
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Rejection Reason"
                value={
                  reviewForm.rejectionReason
                }
                onChange={(
                  event,
                ) =>
                  setReviewForm(
                    (previous) => ({
                      ...previous,
                      rejectionReason:
                        event
                          .target
                          .value,
                    }),
                  )
                }
                inputProps={{
                  maxLength: 500,
                }}
                required
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenDialog(
                false,
              )
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleReview
            }
            disabled={
              reviewMutation.isPending ||
              (reviewForm.status ===
                "REJECTED" &&
                reviewForm.rejectionReason.trim()
                  .length < 3)
            }
          >
            {reviewMutation.isPending
              ? "Saving..."
              : "Submit Review"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeamLeaves;