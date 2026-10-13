
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  AddRounded,
  BusinessRounded,
  DeleteOutlineRounded,
  EditOutlined,
  GroupsRounded,
  InsightsRounded,
  PersonRounded,
} from "@mui/icons-material";

import {
  createDepartmentApi,
  deleteDepartmentApi,
  getDepartmentsApi,
  updateDepartmentApi,
} from "../api/departmentApi";

import { viewEmployeesApi } from "../api/managerApi";
import useAuth from "../hooks/useAuth";

const initialForm = {
  name: "",
  description: "",
};

const getId = (value) => {
  if (!value) return "";

  return typeof value === "object"
    ? String(value._id || "")
    : String(value);
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

const DepartmentManagement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const managerDepartmentId = getId(user?.departmentId);

  const [openForm, setOpenForm] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState(null);
  const [selectedDepartment, setSelectedDepartment] =
    useState(null);
  const [formData, setFormData] = useState({
    ...initialForm,
  });

  const {
    data: departments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartmentsApi,
  });

  // Existing manager endpoint: used only for the manager's own view.
  const {
    data: managerEmployees = [],
    isLoading: managerEmployeesLoading,
    error: managerEmployeesError,
  } = useQuery({
    queryKey: [
      "departmentDetailsEmployees",
      selectedDepartment?._id,
    ],
    queryFn: viewEmployeesApi,
    enabled:
      isManager &&
      Boolean(selectedDepartment) &&
      getId(selectedDepartment?._id) ===
        managerDepartmentId,
  });

  const {
    mutate: createDepartment,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: createDepartmentApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["departments"],
      });
      handleCloseForm();
    },
  });

  const {
    mutate: updateDepartment,
    isPending: isUpdating,
    error: updateError,
  } = useMutation({
    mutationFn: ({ departmentId, departmentData }) =>
      updateDepartmentApi(departmentId, departmentData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["departments"],
      });
      handleCloseForm();
    },
  });

  const {
    mutate: deleteDepartment,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteDepartmentApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["departments"],
      });
    },
  });

  const handleOpenCreate = () => {
    setEditingDepartment(null);
    setFormData({ ...initialForm });
    setOpenForm(true);
  };

  const handleOpenEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name || "",
      description: department.description || "",
    });
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingDepartment(null);
    setFormData({ ...initialForm });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const departmentData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    if (editingDepartment) {
      updateDepartment({
        departmentId: editingDepartment._id,
        departmentData,
      });
      return;
    }

    createDepartment(departmentData);
  };

  const handleDelete = (department) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${department.name}?`,
    );

    if (confirmed) {
      deleteDepartment(department._id);
    }
  };

  const handleOpenDetails = (department) => {
    // Admins can view any department.
    // Managers can view only their own department.
    if (
      isAdmin ||
      (
        isManager &&
        getId(department._id) === managerDepartmentId
      )
    ) {
      setSelectedDepartment(department);
    }
  };

  const handleCloseDetails = () => {
    setSelectedDepartment(null);
  };

  const isSaving = isCreating || isUpdating;
  const mutationError =
    createError || updateError || deleteError;

  const departmentEmployees = isManager
    ? managerEmployees.filter(
        (employee) =>
          getId(employee.departmentId) ===
          getId(selectedDepartment?._id),
      )
    : selectedDepartment?.employees || [];

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
          Loading departments...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {getErrorMessage(error)}
      </Alert>
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "flex-start" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
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
            Departments
          </Typography>

          <Typography sx={{ mt: 1, color: "#64748b" }}>
            Manage departments, assigned managers, and employees.
          </Typography>
        </Box>

        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={handleOpenCreate}
            sx={{
              alignSelf: { xs: "flex-start", sm: "flex-start" },
              px: 2.5,
              py: 1.3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
            }}
          >
            Create Department
          </Button>
        )}
      </Stack>

      {mutationError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {getErrorMessage(mutationError)}
        </Alert>
      )}

      {departments.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
          }}
        >
          <BusinessRounded
            sx={{ fontSize: 44, color: "#94a3b8", mb: 1 }}
          />
          <Typography variant="h6" fontWeight={700}>
            No departments found
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {isAdmin
              ? "Create a department to get started."
              : "Your department has not been configured yet."}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {departments.map((department) => {
            const canViewDetails =
              isAdmin ||
              (
                isManager &&
                getId(department._id) ===
                  managerDepartmentId
              );

            const managers = department.managers || [];
            const employeeCount = (
              department.employees || []
            ).length;

            return (
              <Grid
                key={department._id}
                size={{ xs: 12, sm: 6, lg: 4 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                    borderTop: "5px solid #1976d2",
                    overflow: "hidden",
                  }}
                >
                  <CardContent sx={{ p: 2.8, flexGrow: 1 }}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >
                      <Avatar
                        variant="rounded"
                        sx={{
                          bgcolor: "#e8f1ff",
                          color: "#1976d2",
                          width: 48,
                          height: 48,
                        }}
                      >
                        <BusinessRounded />
                      </Avatar>

                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#172b4d",
                            fontWeight: 800,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {department.name}
                        </Typography>

                        <Chip
                          size="small"
                          label={
                            department.isActive
                              ? "Active"
                              : "Inactive"
                          }
                          color={
                            department.isActive
                              ? "success"
                              : "default"
                          }
                          sx={{
                            mt: 0.8,
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                    </Stack>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 2.5,
                        minHeight: 42,
                        color: "#64748b",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {department.description ||
                        "No description provided."}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography
                      variant="body2"
                      sx={{ color: "#475569", mb: 1.5 }}
                    >
                      Department status:{" "}
                      <Box
                        component="span"
                        sx={{ fontWeight: 800 }}
                      >
                        {department.isActive
                          ? "Active"
                          : "Inactive"}
                      </Box>
                    </Typography>

                    {isAdmin && (
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <PersonRounded
                            fontSize="small"
                            color="primary"
                          />
                          <Typography
                            variant="body2"
                            fontWeight={700}
                          >
                            {managers.length} verified manager
                            {managers.length === 1 ? "" : "s"}
                          </Typography>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <GroupsRounded
                            fontSize="small"
                            color="primary"
                          />
                          <Typography
                            variant="body2"
                            fontWeight={700}
                          >
                            {employeeCount} employee
                            {employeeCount === 1 ? "" : "s"}
                          </Typography>
                        </Stack>

                        {managers.length > 0 && (
                          <Box sx={{ mt: 0.5 }}>
                            {managers.slice(0, 2).map((manager) => (
                              <Typography
                                key={manager._id}
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                Manager: {manager.name}
                              </Typography>
                            ))}

                            {managers.length > 2 && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                +{managers.length - 2} more managers
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Stack>
                    )}
                  </CardContent>

                  {(canViewDetails || isAdmin) && (
                    <>
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
                        {canViewDetails && (
                          <Button
                            variant="contained"
                            startIcon={<InsightsRounded />}
                            onClick={() =>
                              handleOpenDetails(department)
                            }
                            sx={{
                              flexGrow: 1,
                              textTransform: "none",
                              fontWeight: 700,
                              borderRadius: 1.8,
                              boxShadow: "none",
                            }}
                          >
                            Details
                          </Button>
                        )}

                        {isAdmin && (
                          <>
                            <Button
                              variant="outlined"
                              startIcon={<EditOutlined />}
                              onClick={() =>
                                handleOpenEdit(department)
                              }
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
                              color="error"
                              variant="outlined"
                              startIcon={<DeleteOutlineRounded />}
                              onClick={() =>
                                handleDelete(department)
                              }
                              disabled={isDeleting}
                              sx={{
                                flexGrow: 1,
                                textTransform: "none",
                                fontWeight: 700,
                                borderRadius: 1.8,
                              }}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </Box>
                    </>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create/update department form. */}
      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ color: "#172b4d", fontWeight: 800 }}>
            {editingDepartment
              ? "Update Department"
              : "Create Department"}

            <Typography
              variant="body2"
              sx={{ mt: 0.7, color: "#64748b" }}
            >
              Enter the department details below.
            </Typography>
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              {(createError || updateError) && (
                <Alert severity="error">
                  {getErrorMessage(createError || updateError)}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Department Name"
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
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={handleCloseForm}
              disabled={isSaving}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isSaving || !formData.name.trim()}
              sx={{
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {isSaving
                ? "Saving..."
                : editingDepartment
                  ? "Save Changes"
                  : "Create Department"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Admin sees all managers and employees in the selected department. */}
      <Dialog
        open={Boolean(selectedDepartment)}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ color: "#172b4d", fontWeight: 800 }}>
          {selectedDepartment?.name} — Department Details

          <Typography
            variant="body2"
            sx={{ mt: 0.7, color: "#64748b" }}
          >
            Verified managers and the employees each manager created.
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {isManager && managerEmployeesLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {isManager && managerEmployeesError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {getErrorMessage(managerEmployeesError)}
            </Alert>
          )}

          {(!isManager || !managerEmployeesLoading) &&
            (!isManager || !managerEmployeesError) && (
              <>
                <Stack spacing={2.5}>
                  {(isAdmin
                    ? selectedDepartment?.managers || []
                    : [
                        {
                          _id: user?._id,
                          name: user?.name,
                          email: user?.email,
                          employees: departmentEmployees,
                        },
                      ]
                  ).map((manager) => (
                    <Paper
                      key={manager._id}
                      variant="outlined"
                      sx={{ p: 2.5, borderRadius: 2.5 }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                      >
                        <Avatar sx={{ bgcolor: "#e8f1ff", color: "#1976d2" }}>
                          <PersonRounded />
                        </Avatar>

                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography fontWeight={800} color="#172b4d">
                            {manager.name || "Manager"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {manager.email || "No email available"}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          color="primary"
                          label={`${(manager.employees || []).length} employee${
                            (manager.employees || []).length === 1
                              ? ""
                              : "s"
                          }`}
                        />
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      {(manager.employees || []).length === 0 ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          No employees have been created by this manager yet.
                        </Typography>
                      ) : (
                        <Stack spacing={1.5}>
                          {(manager.employees || []).map((employee) => (
                            <Paper
                              key={employee._id}
                              variant="outlined"
                              sx={{
                                p: 1.8,
                                borderRadius: 2,
                                backgroundColor: "#fbfdff",
                              }}
                            >
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1}
                                justifyContent="space-between"
                                alignItems={{
                                  xs: "flex-start",
                                  sm: "center",
                                }}
                              >
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography fontWeight={700}>
                                    {employee.name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {employee.email}
                                  </Typography>
                                </Box>

                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={
                                    employee.designation ||
                                    "Designation not assigned"
                                  }
                                />
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  ))}

                  {isAdmin &&
                    (selectedDepartment?.managers || []).length === 0 && (
                      <Alert severity="info">
                        No verified managers are assigned to this department yet.
                      </Alert>
                    )}

                  {isAdmin &&
                    (selectedDepartment?.employees || []).some(
                      (employee) =>
                        !employee.createdBy ||
                        !(selectedDepartment?.managers || []).some(
                          (manager) =>
                            getId(manager._id) ===
                            getId(employee.createdBy),
                        ),
                    ) && (
                      <Paper
                        variant="outlined"
                        sx={{ p: 2.5, borderRadius: 2.5 }}
                      >
                        <Typography fontWeight={800} sx={{ mb: 1 }}>
                          Employees without a matching verified manager
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          These employees belong to the department, but their
                          creator is not among its verified managers.
                        </Typography>

                        <Stack spacing={1.5}>
                          {(selectedDepartment?.employees || [])
                            .filter(
                              (employee) =>
                                !employee.createdBy ||
                                !(selectedDepartment?.managers || []).some(
                                  (manager) =>
                                    getId(manager._id) ===
                                    getId(employee.createdBy),
                                ),
                            )
                            .map((employee) => (
                              <Box key={employee._id}>
                                <Typography fontWeight={700}>
                                  {employee.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {employee.email}
                                </Typography>
                              </Box>
                            ))}
                        </Stack>
                      </Paper>
                    )}
                </Stack>
              </>
            )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDetails}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentManagement;
