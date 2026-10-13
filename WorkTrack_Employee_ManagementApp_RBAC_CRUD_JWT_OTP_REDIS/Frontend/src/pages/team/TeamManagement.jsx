import { useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  AddRounded,
  AccessTimeRounded,
  BusinessRounded,
  DeleteOutlineRounded,
  EditOutlined,
  GroupsRounded,
  PersonOutlineRounded,
} from "@mui/icons-material";

import dayjs from "dayjs";

import {
  LocalizationProvider,
} from "@mui/x-date-pickers/LocalizationProvider";

import {
  AdapterDayjs,
} from "@mui/x-date-pickers/AdapterDayjs";

import {
  TimePicker,
} from "@mui/x-date-pickers/TimePicker";

import {
  renderTimeViewClock,
} from "@mui/x-date-pickers/timeViewRenderers";

import useAuth from "../../hooks/useAuth";

import {
  createTeamApi,
  deleteTeamApi,
  getAllTeamsApi,
  getTeamMembersApi,
  updateTeamApi,
  addTeamMemberApi,
  removeTeamMemberApi,
} from "../../api/teamApi";

import {
  getAllUsers,
} from "../../api/adminApi";

import {
  viewEmployeesApi,
} from "../../api/managerApi";

const initialForm = {
  name: "",
  description: "",
  managerId: "",
  checkInTime: "",
  checkOutTime: "",
};

// Convert backend HH:mm time into a Dayjs value for the TimePicker.
const getTimePickerValue = (time) => {
  if (!time) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  return dayjs()
    .hour(hours)
    .minute(minutes)
    .second(0)
    .millisecond(0);
};

function TeamManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isAdmin = user?.role === "admin";

  const [openForm, setOpenForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [membersTeam, setMembersTeam] = useState(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [formData, setFormData] = useState({
    ...initialForm,
  });

  const {
    data: teams = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: getAllTeamsApi,
  });

  const {
    data: users = [],
    isLoading: usersLoading,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled: isAdmin,
  });

  const {
    data: managerEmployees = [],
  } = useQuery({
    queryKey: ["managerEmployees"],
    queryFn: viewEmployeesApi,
    enabled: user?.role === "manager",
  });

  // Admins use the users list; managers use their employee list.
  const managers = users.filter(
    (item) => item.role === "manager",
  );

  const employees = isAdmin
    ? users.filter((item) => item.role === "employee")
    : managerEmployees;

  const {
    data: teamMembers = [],
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ["teamMembers", membersTeam?._id],
    queryFn: () => getTeamMembersApi(membersTeam._id),
    enabled: Boolean(membersTeam),
  });

  const invalidateTeamData = () => {
    queryClient.invalidateQueries({
      queryKey: ["teams"],
    });

    queryClient.invalidateQueries({
      queryKey: ["managerEmployees"],
    });

    queryClient.invalidateQueries({
      queryKey: ["users"],
    });
  };

  const createMutation = useMutation({
    mutationFn: createTeamApi,
    onSuccess: () => {
      invalidateTeamData();
      handleCloseForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ teamId, teamData }) =>
      updateTeamApi(teamId, teamData),
    onSuccess: () => {
      invalidateTeamData();
      handleCloseForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeamApi,
    onSuccess: invalidateTeamData,
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, employeeId }) =>
      addTeamMemberApi(teamId, employeeId),
    onSuccess: () => {
      invalidateTeamData();

      queryClient.invalidateQueries({
        queryKey: ["teamMembers", membersTeam?._id],
      });

      setSelectedEmployeeId("");
      setAddMemberOpen(false);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, employeeId }) =>
      removeTeamMemberApi(teamId, employeeId),
    onSuccess: () => {
      invalidateTeamData();

      queryClient.invalidateQueries({
        queryKey: ["teamMembers", membersTeam?._id],
      });
    },
  });

  const handleOpenCreate = () => {
    setEditingTeam(null);
    setFormData({ ...initialForm });
    setOpenForm(true);
  };

  const handleOpenEdit = (team) => {
    setEditingTeam(team);

    setFormData({
      name: team.name || "",
      description: team.description || "",
      managerId: team.managerId?._id || "",
      checkInTime: team.checkInTime || "",
      checkOutTime: team.checkOutTime || "",
    });

    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingTeam(null);
    setFormData({ ...initialForm });
  };

  // Do not discard form data when the dialog backdrop is clicked.
  const handleFormDialogClose = (event, reason) => {
    if (reason === "backdropClick") {
      return;
    }

    handleCloseForm();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCheckInTimeChange = (newValue) => {
    setFormData((previous) => ({
      ...previous,
      // Preserve the backend HH:mm format.
      checkInTime:
        newValue && newValue.isValid()
          ? newValue.format("HH:mm")
          : "",
    }));
  };

  const handleCheckOutTimeChange = (newValue) => {
    setFormData((previous) => ({
      ...previous,
      // Keep time values in the backend HH:mm format.
      checkOutTime:
        newValue && newValue.isValid()
          ? newValue.format("HH:mm")
          : "",
    }));
  };

  // Validate the shift duration before submitting to the backend.
  // If the end time is earlier than or equal to the start, treat it as
  // an overnight shift, for example 22:00 to 06:00.
  const getShiftDurationMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) {
      return null;
    }

    const toMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const start = toMinutes(startTime);
    let end = toMinutes(endTime);

    if (end <= start) {
      end += 24 * 60;
    }

    return end - start;
  };

  const shiftDurationMinutes = getShiftDurationMinutes(
    formData.checkInTime,
    formData.checkOutTime,
  );

  const isShiftDurationValid = shiftDurationMinutes === 8 * 60;

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = formData.name.trim();

    if (
      !name ||
      !formData.checkInTime ||
      !formData.checkOutTime ||
      !isShiftDurationValid
    ) {
      return;
    }

    if (editingTeam) {
      updateMutation.mutate({
        teamId: editingTeam._id,
        teamData: {
          name,
          description: formData.description.trim(),
          checkInTime: formData.checkInTime,
          checkOutTime: formData.checkOutTime,
        },
      });

      return;
    }

    const teamData = {
      name,
      description: formData.description.trim(),
      checkInTime: formData.checkInTime,
      checkOutTime: formData.checkOutTime,
    };

    if (isAdmin) {
      teamData.managerId = formData.managerId;
    }

    createMutation.mutate(teamData);
  };

  const handleDelete = (team) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${team.name}"?`,
    );

    if (confirmed) {
      deleteMutation.mutate(team._id);
    }
  };

  const handleAddMember = () => {
    if (!membersTeam || !selectedEmployeeId) {
      return;
    }

    addMemberMutation.mutate({
      teamId: membersTeam._id,
      employeeId: selectedEmployeeId,
    });
  };

  const handleRemoveMember = (employeeId) => {
    const confirmed = window.confirm(
      "Remove this employee from the team?",
    );

    if (!membersTeam || !confirmed) {
      return;
    }

    removeMemberMutation.mutate({
      teamId: membersTeam._id,
      employeeId,
    });
  };

  // Do not offer employees who already belong to a team.
  const availableEmployees = employees.filter(
    (employee) => !employee.teamId,
  );

  const getErrorMessage = (err) =>
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong. Please try again.";

  const mutationError =
    createMutation.error ||
    updateMutation.error ||
    deleteMutation.error ||
    addMemberMutation.error ||
    removeMemberMutation.error;

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending;

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={28} />

        <Typography color="text.secondary">
          Loading teams...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          {getErrorMessage(error)}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        boxSizing: "border-box",
        backgroundColor: "#f5f7fb",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Container maxWidth="xl" disableGutters>
        {/* The heading stays left and Create Team stays at the top-right. */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "flex-start" },
            gap: 2,
            width: "100%",
            mb: 4,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#172b4d",
                fontSize: {
                  xs: "1.7rem",
                  sm: "2.1rem",
                },
              }}
            >
              Teams
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "#64748b",
              }}
            >
              Manage teams, team members, and check-in schedules.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={handleOpenCreate}
            sx={{
              flexShrink: 0,
              alignSelf: { xs: "flex-start", sm: "flex-start" },
              ml: { sm: "auto" },
              px: 2.5,
              py: 1.3,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "none",
              whiteSpace: "nowrap",
              boxShadow: "none",
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
                boxShadow: "none",
              },
            }}
          >
            Create Team
          </Button>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: 2.5 }}
        >
          <GroupsRounded sx={{ color: "#64748b" }} />

          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            {teams.length} {teams.length === 1 ? "Team" : "Teams"}
          </Typography>
        </Stack>

        {mutationError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {getErrorMessage(mutationError)}
          </Alert>
        )}

        {teams.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              py: 7,
              px: 3,
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mx: "auto",
                mb: 2,
                backgroundColor: "#eaf3ff",
                color: "#1976d2",
              }}
            >
              <GroupsRounded fontSize="large" />
            </Avatar>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 750,
                color: "#172b4d",
              }}
            >
              No teams yet
            </Typography>

            <Typography
              sx={{
                mt: 1,
                mb: 3,
                color: "#64748b",
              }}
            >
              Create your first team to get started.
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={handleOpenCreate}
              sx={{
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Create Team
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {teams.map((team) => (
              <Grid
                key={team._id}
                size={{ xs: 12, sm: 6, lg: 4 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    transition:
                      "transform 180ms ease, box-shadow 180ms ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow:
                        "0 12px 28px rgba(15, 23, 42, 0.08)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 5,
                      backgroundColor: "#1976d2",
                    }}
                  />

                  <CardContent
                    sx={{
                      p: 3,
                      flexGrow: 1,
                      "&:last-child": { pb: 3 },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2.5,
                          backgroundColor: "#eaf3ff",
                          color: "#1976d2",
                        }}
                      >
                        <GroupsRounded />
                      </Avatar>

                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            color: "#172b4d",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {team.name}
                        </Typography>

                        <Chip
                          size="small"
                          label="Team"
                          sx={{
                            mt: 0.8,
                            fontWeight: 700,
                            color: "#1769aa",
                            backgroundColor: "#eaf3ff",
                          }}
                        />
                      </Box>
                    </Stack>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 2,
                        minHeight: 40,
                        lineHeight: 1.7,
                        color: "#64748b",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {team.description || "No description provided."}
                    </Typography>

                    <Divider sx={{ my: 2.2 }} />

                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        spacing={1.2}
                        alignItems="flex-start"
                      >
                        <BusinessRounded
                          sx={{
                            mt: 0.2,
                            fontSize: 20,
                            color: "#64748b",
                          }}
                        />

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748b" }}
                          >
                            Department
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: "#172b4d",
                              fontWeight: 700,
                            }}
                          >
                            {team.departmentId?.name || "N/A"}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1.2}
                        alignItems="flex-start"
                      >
                        <PersonOutlineRounded
                          sx={{
                            mt: 0.2,
                            fontSize: 20,
                            color: "#64748b",
                          }}
                        />

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748b" }}
                          >
                            Manager
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: "#172b4d",
                              fontWeight: 700,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {team.managerId?.name || "N/A"}
                            {team.managerId?.designation
                              ? ` (${team.managerId.designation})`
                              : ""}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1.2}
                        alignItems="center"
                      >
                        <AccessTimeRounded
                          sx={{
                            fontSize: 20,
                            color: "#64748b",
                          }}
                        />

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748b" }}
                          >
                            Check-in Time
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: "#172b4d",
                              fontWeight: 700,
                            }}
                          >
                            {team.checkInTime || "Not set"}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1.2}
                        alignItems="center"
                      >
                        <AccessTimeRounded
                          sx={{
                            fontSize: 20,
                            color: "#64748b",
                          }}
                        />

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748b" }}
                          >
                            Shift End Time
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: "#172b4d",
                              fontWeight: 700,
                            }}
                          >
                            {team.checkOutTime || "Not set"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>

                  <Divider />

                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      backgroundColor: "#fcfdff",
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<GroupsRounded />}
                      onClick={() => setMembersTeam(team)}
                      sx={{
                        flexGrow: 1,
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 1.8,
                      }}
                    >
                      Members
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditOutlined />}
                      onClick={() => handleOpenEdit(team)}
                      sx={{
                        flexGrow: 1,
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 1.8,
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<DeleteOutlineRounded />}
                      onClick={() => handleDelete(team)}
                      disabled={deleteMutation.isPending}
                      sx={{
                        flexGrow: 1,
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 1.8,
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Create/update team dialog */}
      <Dialog
        open={openForm}
        onClose={handleFormDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle
            sx={{
              pb: 1,
              color: "#172b4d",
              fontWeight: 800,
            }}
          >
            {editingTeam ? "Update Team" : "Create Team"}

            <Typography
              variant="body2"
              sx={{
                mt: 0.7,
                color: "#64748b",
              }}
            >
              Enter the team details below.
            </Typography>
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              {(createMutation.error || updateMutation.error) && (
                <Alert severity="error">
                  {getErrorMessage(
                    createMutation.error || updateMutation.error,
                  )}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Team Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                inputProps={{
                  minLength: 2,
                  maxLength: 50,
                }}
              />

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                inputProps={{ maxLength: 200 }}
              />

              {isAdmin && !editingTeam && (
                <FormControl fullWidth required>
                  <InputLabel id="team-manager-label">
                    Manager
                  </InputLabel>

                  <Select
                    labelId="team-manager-label"
                    label="Manager"
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleChange}
                    disabled={usersLoading}
                  >
                    {managers.map((manager) => (
                      <MenuItem
                        key={manager._id}
                        value={manager._id}
                      >
                        {manager.name}
                        {manager.designation
                          ? ` (${manager.designation})`
                          : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack spacing={2}>
                  <TimePicker
                    label="Shift Start / Check-in Time"
                    value={getTimePickerValue(formData.checkInTime)}
                    onChange={handleCheckInTimeChange}
                    ampm
                    ampmInClock
                    minutesStep={1}
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />

                  <TimePicker
                    label="Shift End / Check-out Time"
                    value={getTimePickerValue(formData.checkOutTime)}
                    onChange={handleCheckOutTimeChange}
                    ampm
                    ampmInClock
                    minutesStep={1}
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error:
                          Boolean(formData.checkInTime) &&
                          Boolean(formData.checkOutTime) &&
                          !isShiftDurationValid,
                        helperText:
                          formData.checkInTime && formData.checkOutTime
                            ? isShiftDurationValid
                              ? "Shift duration: 8 hours"
                              : "Shift start and end must be exactly 8 hours apart. Overnight shifts are supported."
                            : "Set a shift start and end time exactly 8 hours apart.",
                      },
                    }}
                  />
                </Stack>
              </LocalizationProvider>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              onClick={handleCloseForm}
              disabled={isSaving}
              sx={{
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={
                isSaving ||
                !formData.name.trim() ||
                !formData.checkInTime ||
                !formData.checkOutTime ||
                !isShiftDurationValid ||
                (isAdmin &&
                  !editingTeam &&
                  !formData.managerId)
              }
              startIcon={
                isSaving ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <AddRounded />
                )
              }
              sx={{
                minWidth: 130,
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
              }}
            >
              {isSaving
                ? "Saving..."
                : editingTeam
                  ? "Save Changes"
                  : "Create Team"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* View, add, and remove team members */}
      <Dialog
        open={Boolean(membersTeam)}
        onClose={() => setMembersTeam(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            color: "#172b4d",
            fontWeight: 800,
          }}
        >
          {membersTeam?.name} — Team Members
        </DialogTitle>

        <DialogContent dividers>
          {membersLoading ? (
            <Box
              sx={{
                py: 4,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : membersError ? (
            <Alert severity="error">
              {getErrorMessage(membersError)}
            </Alert>
          ) : teamMembers.length === 0 ? (
            <Alert severity="info">
              No employees are currently assigned to this team.
            </Alert>
          ) : (
            <Stack spacing={1}>
              {teamMembers.map((member) => (
                <Paper
                  key={member._id}
                  elevation={0}
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    border: "1px solid #e2e8f0",
                    borderRadius: 2,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ minWidth: 0 }}
                  >
                    <Avatar
                      sx={{
                        backgroundColor: "#eaf3ff",
                        color: "#1976d2",
                        fontWeight: 700,
                      }}
                    >
                      {member.name?.charAt(0)?.toUpperCase() || "E"}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 750,
                          color: "#172b4d",
                        }}
                      >
                        {member.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {member.email}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b" }}
                      >
                        {member.designation || "Employee"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => handleRemoveMember(member._id)}
                    disabled={removeMemberMutation.isPending}
                    sx={{
                      flexShrink: 0,
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    Remove
                  </Button>
                </Paper>
              ))}
            </Stack>
          )}

          {(addMemberMutation.error ||
            removeMemberMutation.error) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {getErrorMessage(
                addMemberMutation.error ||
                  removeMemberMutation.error,
              )}
            </Alert>
          )}

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            sx={{
              mt: 2.5,
              textTransform: "none",
              fontWeight: 700,
            }}
            onClick={() => {
              setSelectedEmployeeId("");
              setAddMemberOpen(true);
            }}
          >
            Add Employee
          </Button>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setMembersTeam(null)}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Select an available employee to add to the selected team. */}
      <Dialog
        open={addMemberOpen}
        onClose={() => {
          setAddMemberOpen(false);
          setSelectedEmployeeId("");
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            color: "#172b4d",
            fontWeight: 800,
          }}
        >
          Add Employee

          <Typography
            variant="body2"
            sx={{
              mt: 0.7,
              color: "#64748b",
            }}
          >
            Select an available employee for {membersTeam?.name}.
          </Typography>
        </DialogTitle>

        <DialogContent>
          {availableEmployees.length === 0 ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              No available employees found.
            </Alert>
          ) : (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="add-team-employee-label">
                Select Employee
              </InputLabel>

              <Select
                labelId="add-team-employee-label"
                label="Select Employee"
                value={selectedEmployeeId}
                onChange={(event) =>
                  setSelectedEmployeeId(event.target.value)
                }
              >
                {availableEmployees.map((employee) => (
                  <MenuItem
                    key={employee._id}
                    value={employee._id}
                  >
                    {employee.name} — {employee.email}
                    {employee.designation
                      ? ` (${employee.designation})`
                      : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {addMemberMutation.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {getErrorMessage(addMemberMutation.error)}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setAddMemberOpen(false);
              setSelectedEmployeeId("");
            }}
            disabled={addMemberMutation.isPending}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleAddMember}
            disabled={
              !selectedEmployeeId ||
              addMemberMutation.isPending
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {addMemberMutation.isPending
              ? "Adding..."
              : "Add Employee"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeamManagement;