import {
  useMemo,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  useNavigate,
} from "react-router-dom";

import {
  getAllUsers,
  deleteManagerApi,
  deleteEmployeeApi,
} from "../../api/adminApi";

const ViewUsers = () => {
  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  /*
   * Fetch all users from the backend.
   * The backend returns admin, manager
   * and employee users together.
   */
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "users",
    ],

    queryFn:
      getAllUsers,
  });

  /*
   * Separate users according to their role.
   */
  const admins =
    useMemo(
      () =>
        users.filter(
          (user) =>
            user.role ===
            "admin",
        ),
      [users],
    );

  const managers =
    useMemo(
      () =>
        users.filter(
          (user) =>
            user.role ===
            "manager",
        ),
      [users],
    );

  const employees =
    useMemo(
      () =>
        users.filter(
          (user) =>
            user.role ===
            "employee",
        ),
      [users],
    );

  /*
   * Delete manager or employee.
   *
   * Admin users cannot be deleted from
   * this page.
   */
  const {
    mutate: deleteUser,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: ({
      userId,
      role,
    }) => {
      if (
        role ===
        "manager"
      ) {
        return deleteManagerApi(
          userId,
        );
      }

      return deleteEmployeeApi(
        userId,
      );
    },

    onSuccess: () => {
      /*
       * Refresh the user list after
       * successful deletion.
       */
      queryClient.invalidateQueries({
        queryKey: [
          "users",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "managers",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "employees",
        ],
      });
    },
  });

  /*
   * Navigate to the correct update page
   * depending on the user's role.
   */
  const handleUpdate = (
    user,
  ) => {
    if (
      user.role ===
      "manager"
    ) {
      navigate(
        `/admin/update-manager/${user._id}`,
      );

      return;
    }

    if (
      user.role ===
      "employee"
    ) {
      navigate(
        `/admin/update-employee/${user._id}`,
      );
    }
  };

  /*
   * Confirm before deleting a user.
   */
  const handleDelete = (
    user,
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${user.name}?`,
      );

    if (!confirmed) {
      return;
    }

    deleteUser({
      userId:
        user._id,

      role:
        user.role,
    });
  };

  if (isLoading) {
    return (
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
    );
  }

  if (error) {
    return (
      <Box>
        <Typography
          color="error"
        >
          {error.response
            ?.data?.message ||
            error.message ||
            "Failed to load users"}
        </Typography>
      </Box>
    );
  }

  /*
   * Reusable user card.
   */
  const renderUserCard = (
    user,
  ) => {
    return (
      <Card
        key={
          user._id
        }
        variant="outlined"
        sx={{
          mb: 2,
        }}
      >
        <CardContent>
          <Stack
            spacing={1}
          >
            <Typography
              variant="h6"
              fontWeight={700}
            >
              {user.name}
            </Typography>

            <Typography
              variant="body2"
            >
              <strong>
                Email:
              </strong>{" "}
              {user.email}
            </Typography>

            <Typography
              variant="body2"
            >
              <strong>
                Department:
              </strong>{" "}
              {user.department ||
                "N/A"}
            </Typography>

            <Typography
              variant="body2"
            >
              <strong>
                Designation:
              </strong>{" "}
              {user.designation ||
                "N/A"}
            </Typography>

            {/*
             * Admin users are displayed
             * without Update/Delete buttons.
             */}
            {user.role !==
              "admin" && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  pt: 1,
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    handleUpdate(
                      user,
                    )
                  }
                >
                  Update
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() =>
                    handleDelete(
                      user,
                    )
                  }
                  disabled={
                    isDeleting
                  }
                >
                  {isDeleting
                    ? "Deleting..."
                    : "Delete"}
                </Button>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Page heading */}
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{
          mb: 3,
        }}
      >
        View Users
      </Typography>

      {/* Three separate user columns */}
      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, minmax(0, 1fr))",
          },

          gap: 3,

          alignItems:
            "start",
        }}
      >
        {/* Admin column */}
        <Card
          sx={{
            height:
              "100%",
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                mb: 2,
              }}
            >
              Admin
            </Typography>

            <Divider
              sx={{
                mb: 2,
              }}
            />

            {admins.length ===
            0 ? (
              <Typography
                color="text.secondary"
              >
                No admin found.
              </Typography>
            ) : (
              admins.map(
                renderUserCard,
              )
            )}
          </CardContent>
        </Card>

        {/* Manager column */}
        <Card
          sx={{
            height:
              "100%",
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                mb: 2,
              }}
            >
              Managers
            </Typography>

            <Divider
              sx={{
                mb: 2,
              }}
            />

            {managers.length ===
            0 ? (
              <Typography
                color="text.secondary"
              >
                No managers found.
              </Typography>
            ) : (
              managers.map(
                renderUserCard,
              )
            )}
          </CardContent>
        </Card>

        {/* Employee column */}
        <Card
          sx={{
            height:
              "100%",
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                mb: 2,
              }}
            >
              Employees
            </Typography>

            <Divider
              sx={{
                mb: 2,
              }}
            />

            {employees.length ===
            0 ? (
              <Typography
                color="text.secondary"
              >
                No employees found.
              </Typography>
            ) : (
              employees.map(
                renderUserCard,
              )
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Delete error */}
      {deleteError && (
        <Typography
          color="error"
          sx={{
            mt: 2,
          }}
        >
          {deleteError.response
            ?.data?.message ||
            deleteError.message ||
            "Failed to delete user"}
        </Typography>
      )}
    </Box>
  );
};

export default ViewUsers;