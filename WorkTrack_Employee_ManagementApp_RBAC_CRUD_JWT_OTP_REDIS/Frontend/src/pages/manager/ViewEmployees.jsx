
import { useNavigate } from "react-router-dom";
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
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  BadgeRounded,
  BusinessRounded,
  DeleteOutlineRounded,
  EditRounded,
  GroupsRounded,
  MailOutlineRounded,
  PersonOutlineRounded,
} from "@mui/icons-material";

import {
  deleteEmployeeApi,
  viewEmployeesApi,
} from "../../api/managerApi";

const ViewEmployees = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch employees available to the logged-in manager.
  const {
    data: employees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: viewEmployeesApi,
  });

  // Delete an employee using the existing backend API.
  const deleteMutation = useMutation({
    mutationFn: deleteEmployeeApi,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      queryClient.invalidateQueries({
        queryKey: ["managerEmployees"],
      });
    },
  });

  const handleDelete = (employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}?`,
    );

    if (confirmed) {
      deleteMutation.mutate(employee._id);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        width: "100%",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 5 },
        backgroundColor: "#f5f7fb",
      }}
    >
      <Container maxWidth="xl" disableGutters>
        {/* Page heading and employee count */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#172b4d",
                fontSize: {
                  xs: "1.8rem",
                  sm: "2.1rem",
                },
              }}
            >
              View Employees
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "#64748b",
                lineHeight: 1.7,
              }}
            >
              View and manage employees in your department.
            </Typography>
          </Box>

          {!isLoading && !error && (
            <Chip
              icon={<GroupsRounded />}
              label={`${employees.length} ${
                employees.length === 1
                  ? "Employee"
                  : "Employees"
              }`}
              sx={{
                height: 38,
                px: 1,
                borderRadius: 2,
                fontWeight: 700,
                color: "#1565c0",
                backgroundColor: "#eaf3ff",
              }}
            />
          )}
        </Box>

        {/* Loading state */}
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              py: 8,
            }}
          >
            <CircularProgress size={28} />

            <Typography color="text.secondary">
              Loading employees...
            </Typography>
          </Box>
        )}

        {/* Employee list error */}
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error.response?.data?.message ||
              error.message ||
              "Unable to load employees."}
          </Alert>
        )}

        {/* Delete operation error */}
        {deleteMutation.isError && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {deleteMutation.error?.response?.data?.message ||
              deleteMutation.error?.message ||
              "Unable to delete employee."}
          </Alert>
        )}

        {/* Empty state */}
        {!isLoading &&
          !error &&
          employees.length === 0 && (
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                textAlign: "center",
                py: { xs: 5, md: 7 },
              }}
            >
              <CardContent>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mx: "auto",
                    mb: 2,
                    color: "#1976d2",
                    backgroundColor: "#eaf3ff",
                  }}
                >
                  <GroupsRounded sx={{ fontSize: 32 }} />
                </Avatar>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 750,
                    color: "#172b4d",
                  }}
                >
                  No employees found
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "#64748b",
                  }}
                >
                  Employees assigned to your scope will
                  appear here.
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<PersonOutlineRounded />}
                  onClick={() =>
                    navigate("/manager/create-employee")
                  }
                  sx={{
                    mt: 3,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Create Employee
                </Button>
              </CardContent>
            </Card>
          )}

        {/* Employee cards */}
        {!isLoading && !error && employees.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              gap: 3,
            }}
          >
            {employees.map((employee) => (
              <Card
                key={employee._id}
                elevation={0}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  boxShadow:
                    "0 5px 20px rgba(15, 23, 42, 0.04)",
                  transition:
                    "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow:
                      "0 12px 28px rgba(15, 23, 42, 0.09)",
                  },
                }}
              >
                {/* Employee identity */}
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 3 }}
                  >
                    <Avatar
                      sx={{
                        width: 54,
                        height: 54,
                        fontWeight: 750,
                        fontSize: 20,
                        color: "#1565c0",
                        backgroundColor: "#eaf3ff",
                      }}
                    >
                      {employee.name
                        ?.trim()
                        ?.charAt(0)
                        ?.toUpperCase() || "E"}
                    </Avatar>

                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 750,
                          fontSize: "1.05rem",
                          color: "#172b4d",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {employee.name || "Unnamed Employee"}
                      </Typography>

                      <Chip
                        size="small"
                        label={employee.role || "employee"}
                        sx={{
                          mt: 0.7,
                          textTransform: "capitalize",
                          fontWeight: 600,
                          color: "#166534",
                          backgroundColor: "#dcfce7",
                        }}
                      />
                    </Box>
                  </Stack>

                  <Divider sx={{ mb: 2.5 }} />

                  {/* Employee details */}
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "flex-start",
                      }}
                    >
                      <MailOutlineRounded
                        sx={{
                          mt: 0.2,
                          color: "#64748b",
                          fontSize: 21,
                        }}
                      />

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748b" }}
                        >
                          Email Address
                        </Typography>

                        <Typography
                          sx={{
                            color: "#334155",
                            overflowWrap: "anywhere",
                            fontWeight: 500,
                          }}
                        >
                          {employee.email || "Not provided"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "flex-start",
                      }}
                    >
                      <BusinessRounded
                        sx={{
                          mt: 0.2,
                          color: "#64748b",
                          fontSize: 21,
                        }}
                      />

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748b" }}
                        >
                          Department
                        </Typography>

                        <Typography
                          sx={{
                            color: "#334155",
                            fontWeight: 600,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {employee.department || "Not assigned"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "flex-start",
                      }}
                    >
                      <BadgeRounded
                        sx={{
                          mt: 0.2,
                          color: "#64748b",
                          fontSize: 21,
                        }}
                      />

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748b" }}
                        >
                          Designation
                        </Typography>

                        <Typography
                          sx={{
                            color: "#334155",
                            fontWeight: 600,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {employee.designation || "Not assigned"}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>

                <Divider />

                {/* Employee actions */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                    p: 2.5,
                    backgroundColor: "#fbfcfe",
                  }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<EditRounded />}
                    onClick={() =>
                      navigate(
                        `/manager/update-employee/${employee._id}`,
                      )
                    }
                    sx={{
                      flex: "1 1 130px",
                      borderRadius: 2,
                      py: 1.1,
                      textTransform: "none",
                      fontWeight: 700,
                      boxShadow: "none",
                      backgroundColor: "#1976d2",
                      "&:hover": {
                        backgroundColor: "#1565c0",
                        boxShadow: "none",
                      },
                    }}
                  >
                    Update
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineRounded />}
                    onClick={() => handleDelete(employee)}
                    disabled={deleteMutation.isPending}
                    sx={{
                      flex: "1 1 130px",
                      borderRadius: 2,
                      py: 1.1,
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    {deleteMutation.isPending
                      ? "Deleting..."
                      : "Delete"}
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ViewEmployees;