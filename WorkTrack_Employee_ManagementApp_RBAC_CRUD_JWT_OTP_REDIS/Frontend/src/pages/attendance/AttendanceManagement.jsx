import {
  useState,
  useContext,
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

import AuthContext from "../../context/AuthContextValue";

import {
  getAllTeamsApi,
} from "../../api/teamApi";

import {
  getAllAttendanceApi,
  getAllAttendanceByDateApi,
  getAttendanceByDateAndTeamApi,
  getTeamAttendanceApi,
  getTeamAttendanceByDateApi,
  correctAttendanceApi,
} from "../../api/attendanceApi";

function AttendanceManagement() {
  const {
    user,
  } = useContext(AuthContext);

  const queryClient =
    useQueryClient();

  const isAdmin =
    user?.role === "admin";

  const isManager =
    user?.role === "manager";

  const [
    selectedTeamId,
    setSelectedTeamId,
  ] = useState("");

  const [
    selectedDate,
    setSelectedDate,
  ] = useState("");

  const [
    openCorrectionDialog,
    setOpenCorrectionDialog,
  ] = useState(false);

  const [
    selectedAttendance,
    setSelectedAttendance,
  ] = useState(null);

  const [
    correctionForm,
    setCorrectionForm,
  ] = useState({
    status: "",
    correctionReason: "",
  });

  /*
   * Fetch teams for admin and manager.
   * The backend controls which teams a manager can see.
   */
  const {
    data: teams = [],
    isLoading: teamsLoading,
  } = useQuery({
    queryKey: [
      "attendance-teams",
    ],

    queryFn:
      getAllTeamsApi,

    enabled:
      isAdmin ||
      isManager,
  });

  /*
   * Fetch attendance according to the
   * logged-in user's role and selected filters.
   */
  const {
    data: attendance = [],
    isLoading: attendanceLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "attendance-management",
      user?.role,
      selectedTeamId,
      selectedDate,
    ],

    queryFn: async () => {
      if (isManager) {
        /*
         * Manager must select a team
         * before attendance is loaded.
         */
        if (!selectedTeamId) {
          return [];
        }

        /*
         * Manager + date filter.
         */
        if (selectedDate) {
          return getTeamAttendanceByDateApi(
            selectedTeamId,
            selectedDate,
          );
        }

        /*
         * Manager without date filter.
         */
        return getTeamAttendanceApi(
          selectedTeamId,
        );
      }

      if (isAdmin) {
        /*
         * Admin + team + date.
         */
        if (
          selectedDate &&
          selectedTeamId
        ) {
          return getAttendanceByDateAndTeamApi(
            selectedDate,
            selectedTeamId,
          );
        }

        /*
         * Admin + date only.
         */
        if (selectedDate) {
          return getAllAttendanceByDateApi(
            selectedDate,
          );
        }

        /*
         * Admin without filters.
         */
        return getAllAttendanceApi();
      }

      return [];
    },

    enabled:
      isAdmin ||
      (
        isManager &&
        !!selectedTeamId
      ),
  });

  /*
   * Admin-only attendance correction.
   */
  const correctionMutation =
    useMutation({
      mutationFn: ({
        attendanceId,
        data,
      }) =>
        correctAttendanceApi(
          attendanceId,
          data,
        ),

      onSuccess: () => {
        /*
         * Refresh attendance after
         * a successful correction.
         */
        queryClient.invalidateQueries({
          queryKey: [
            "attendance-management",
          ],
        });

        setOpenCorrectionDialog(
          false,
        );

        setSelectedAttendance(
          null,
        );

        setCorrectionForm({
          status: "",
          correctionReason: "",
        });
      },
    });

  /*
   * Format date and time for display.
   */
  const formatDateTime = (
    date,
  ) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date,
    ).toLocaleString();
  };

  /*
   * Format attendance date.
   */
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

  /*
   * Convert working minutes
   * into readable hours and minutes.
   */
  const formatWorkingTime = (
    minutes,
  ) => {
    if (!minutes) {
      return "0 min";
    }

    const hours =
      Math.floor(
        minutes / 60,
      );

    const remainingMinutes =
      minutes % 60;

    return hours > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${remainingMinutes} min`;
  };

  /*
   * Open attendance correction dialog.
   */
  const handleOpenCorrection = (
    record,
  ) => {
    setSelectedAttendance(
      record,
    );

    setCorrectionForm({
      status:
        record.status ||
        "PRESENT",

      correctionReason:
        record.correctionReason ||
        "",
    });

    setOpenCorrectionDialog(
      true,
    );
  };

  /*
   * Submit attendance correction.
   */
  const handleCorrectAttendance =
    () => {
      if (
        !selectedAttendance
      ) {
        return;
      }

      correctionMutation.mutate({
        attendanceId:
          selectedAttendance._id,

        data: {
          status:
            correctionForm.status,

          correctionReason:
            correctionForm.correctionReason,
        },
      });
    };

  /*
   * Clear both attendance filters.
   */
  const handleClearFilters = () => {
    setSelectedTeamId("");
    setSelectedDate("");
  };

  if (
    !isAdmin &&
    !isManager
  ) {
    return (
      <Alert severity="error">
        You are not authorized to
        access attendance
        management.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Page heading */}
      <Typography
        variant="h4"
        fontWeight={700}
      >
        Attendance Management
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mb: 3,
        }}
      >
        {isAdmin
          ? "View and correct employee attendance."
          : "View attendance of your teams."}
      </Typography>

      {/* Attendance filters */}
      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          {/*
           * CSS grid is used here instead of
           * MUI Grid so the filter fields keep
           * their correct width and never overlap.
           */}
          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                md: isAdmin
                  ? "minmax(0, 1fr) minmax(0, 1fr) auto"
                  : "minmax(0, 1fr) minmax(0, 1fr)",
              },

              gap: 2,

              alignItems: "center",

              width: "100%",
            }}
          >
            {/* Team filter */}
            <FormControl
              fullWidth
            >
              <InputLabel id="attendance-team-label">
                Team
              </InputLabel>

              <Select
                labelId="attendance-team-label"
                label="Team"
                value={
                  selectedTeamId
                }
                onChange={(event) =>
                  setSelectedTeamId(
                    event.target.value,
                  )
                }
                disabled={
                  teamsLoading
                }
              >
                <MenuItem value="">
                  {isAdmin
                    ? "All Teams"
                    : "Select Team"}
                </MenuItem>

                {teams.map(
                  (team) => (
                    <MenuItem
                      key={
                        team._id
                      }
                      value={
                        team._id
                      }
                    >
                      {team.name}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            {/* Attendance date filter */}
            <TextField
              fullWidth
              type="date"
              label="Attendance Date"
              value={
                selectedDate
              }
              onChange={(event) =>
                setSelectedDate(
                  event.target.value,
                )
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            {/* Admin clear filter button */}
            {isAdmin && (
              <Button
                variant="outlined"
                onClick={
                  handleClearFilters
                }
                sx={{
                  minWidth: 130,
                  height: 40,
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Attendance table */}
      <Card>
        <CardContent>
          {attendanceLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "center",
                py: 5,
              }}
            >
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert severity="error">
              {error?.response
                ?.data?.message ||
                error?.message ||
                "Failed to load attendance"}
            </Alert>
          ) : attendance.length ===
            0 ? (
            <Alert severity="info">
              No attendance records
              found.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Employee
                    </TableCell>

                    <TableCell>
                      Date
                    </TableCell>

                    <TableCell>
                      Check In
                    </TableCell>

                    <TableCell>
                      Check Out
                    </TableCell>

                    <TableCell>
                      Working Time
                    </TableCell>

                    <TableCell>
                      Status
                    </TableCell>

                    {isAdmin && (
                      <TableCell>
                        Action
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {attendance.map(
                    (
                      record,
                      index,
                    ) => {
                      /*
                       * Some generated attendance
                       * records may not contain _id.
                       */
                      const rowKey =
                        record._id ||
                        `${
                          record
                            .employeeId
                            ?._id ||
                          record
                            .employeeId
                            ?.name ||
                          "employee"
                        }-${index}`;

                      return (
                        <TableRow
                          key={
                            rowKey
                          }
                        >
                          <TableCell>
                            {record
                              .employeeId
                              ?.name ||
                              "N/A"}
                          </TableCell>

                          <TableCell>
                            {formatDate(
                              record.attendanceDate,
                            )}
                          </TableCell>

                          <TableCell>
                            {formatDateTime(
                              record.checkInAt,
                            )}
                          </TableCell>

                          <TableCell>
                            {formatDateTime(
                              record.checkOutAt,
                            )}
                          </TableCell>

                          <TableCell>
                            {formatWorkingTime(
                              record.totalWorkingMinutes,
                            )}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={
                                record.status
                              }
                              size="small"
                            />
                          </TableCell>

                          {isAdmin && (
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                disabled={
                                  !record._id
                                }
                                onClick={() =>
                                  handleOpenCorrection(
                                    record,
                                  )
                                }
                              >
                                Correct
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Admin attendance correction dialog */}
      <Dialog
        open={
          openCorrectionDialog
        }
        onClose={() =>
          setOpenCorrectionDialog(
            false,
          )
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Correct Attendance
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={3}
            sx={{
              mt: 1,
            }}
          >
            <FormControl
              fullWidth
            >
              <InputLabel id="correction-status-label">
                Status
              </InputLabel>

              <Select
                labelId="correction-status-label"
                label="Status"
                value={
                  correctionForm.status
                }
                onChange={(event) =>
                  setCorrectionForm(
                    (previous) => ({
                      ...previous,

                      status:
                        event.target
                          .value,
                    }),
                  )
                }
              >
                <MenuItem value="PRESENT">
                  PRESENT
                </MenuItem>

                <MenuItem value="LATE">
                  LATE
                </MenuItem>

                <MenuItem value="HALF_DAY">
                  HALF_DAY
                </MenuItem>

                <MenuItem value="ABSENT">
                  ABSENT
                </MenuItem>

                <MenuItem value="ON_LEAVE">
                  ON_LEAVE
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Correction Reason"
              value={
                correctionForm.correctionReason
              }
              onChange={(event) =>
                setCorrectionForm(
                  (previous) => ({
                    ...previous,

                    correctionReason:
                      event.target
                        .value,
                  }),
                )
              }
              helperText="Correction reason is required."
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenCorrectionDialog(
                false,
              )
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleCorrectAttendance
            }
            disabled={
              correctionMutation.isPending ||
              !correctionForm.status ||
              correctionForm.correctionReason.trim()
                .length < 3
            }
          >
            {correctionMutation.isPending
              ? "Saving..."
              : "Save Correction"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AttendanceManagement;