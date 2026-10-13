import {
  Box,
  CircularProgress,
} from "@mui/material";

import {
  Navigate,
  Outlet,
} from "react-router-dom";

import useAuth from "../hooks/useAuth";

/*
 * If a logged-in user attempts to open
 * another role's dashboard, send them
 * to their own dashboard instead.
 */
const dashboardByRole = {
  admin: "/admin/dashboard",
  manager: "/manager/dashboard",
  employee: "/employee/dashboard",
};

function ProtectedRoute({
  allowedRoles,
}) {
  const {
    user,
    loading,
  } = useAuth();

  /*
   * Wait until AuthContext finishes checking
   * the existing authentication cookie.
   */
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent:
            "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /*
   * No authenticated user.
   */
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
   * User is authenticated but doesn't have
   * permission to access this role's route.
   */
  if (
    !allowedRoles.includes(
      user.role,
    )
  ) {
    return (
      <Navigate
        to={
          dashboardByRole[
            user.role
          ] || "/login"
        }
        replace
      />
    );
  }

  /*
   * Authentication and role are valid,
   * so render the protected child route.
   */
  return <Outlet />;
}

export default ProtectedRoute;