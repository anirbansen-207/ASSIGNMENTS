
import { createBrowserRouter, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";

import Login from "../pages/auth/Login";
import VerifyAccount from "../pages/auth/VerifyAccount";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ViewUsers from "../pages/admin/ViewUsers";
import CreateManager from "../pages/admin/CreateManager";
import UpdateManager from "../pages/admin/UpdateManager";
import AdminUpdateEmployee from "../pages/admin/UpdateEmployee";
import AdminActivityFeed from "../pages/admin/AdminActivityFeed";

import ManagerDashboard from "../pages/manager/ManagerDashboard";
import CreateEmployee from "../pages/manager/CreateEmployee";
import ViewEmployees from "../pages/manager/ViewEmployees";
import UpdateEmployee from "../pages/manager/UpdateEmployee";
import AssignDepartment from "../pages/manager/AssignDepartment";
import AssignDesignation from "../pages/manager/AssignDesignantion";

import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import OwnProfile from "../pages/employee/OwnProfile";
import UpdateProfile from "../pages/employee/UpdateProfile";

import DepartmentManagement from "../pages/DepartmentManagement";
import TeamManagement from "../pages/team/TeamManagement";
import MyTeam from "../pages/team/MyTeam";

import TaskManagement from "../pages/task/TaskManagement";
import MyTasks from "../pages/task/MyTasks";
import TaskDetails from "../pages/task/TaskDetails";

import MyAttendance from "../pages/attendance/MyAttendance";
import AttendanceManagement from "../pages/attendance/AttendanceManagement";
import ExtraWorkAudit from "../pages/attendance/ExtraWorkAudit";

import MyLeave from "../pages/leave/MyLeave";
import TeamLeaves from "../pages/leave/TeamLeaves";
import TeamLeaveCalendar from "../pages/leave/TeamLeaveCalendar";
import AdminLeaves from "../pages/leave/AdminLeaves";

import Notifications from "../pages/notification/Notifications";
import Analytics from "../pages/analytics/Analytics";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "login", element: <Login /> },
      { path: "verify-account", element: <VerifyAccount /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },

  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "users", element: <ViewUsers /> },
          { path: "departments", element: <DepartmentManagement /> },
          { path: "create-manager", element: <CreateManager /> },
          { path: "update-manager/:id", element: <UpdateManager /> },
          { path: "update-employee/:id", element: <AdminUpdateEmployee /> },
          { path: "teams", element: <TeamManagement /> },
          { path: "tasks", element: <TaskManagement /> },
          { path: "tasks/:taskId", element: <TaskDetails /> },
          { path: "attendance", element: <AttendanceManagement /> },
          { path: "leave", element: <AdminLeaves /> },
          { path: "notifications", element: <Notifications /> },
          { path: "activity-feed", element: <AdminActivityFeed /> },
          { path: "analytics", element: <Analytics /> },
          { path: "extra-work-audit", element: <ExtraWorkAudit /> },
        ],
      },
    ],
  },

  {
    path: "/manager",
    element: <ProtectedRoute allowedRoles={["manager"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          { path: "dashboard", element: <ManagerDashboard /> },
          { path: "departments", element: <DepartmentManagement /> },
          { path: "create-employee", element: <CreateEmployee /> },
          { path: "employees", element: <ViewEmployees /> },
          { path: "update-employee/:id", element: <UpdateEmployee /> },
          { path: "assign-department", element: <AssignDepartment /> },
          { path: "assign-designation", element: <AssignDesignation /> },
          { path: "teams", element: <TeamManagement /> },
          { path: "tasks", element: <TaskManagement /> },
          { path: "tasks/:taskId", element: <TaskDetails /> },
          { path: "attendance", element: <AttendanceManagement /> },
          { path: "leave", element: <TeamLeaves /> },
          { path: "leave-calendar", element: <TeamLeaveCalendar /> },
          { path: "notifications", element: <Notifications /> },
          { path: "analytics", element: <Analytics /> },
        ],
      },
    ],
  },

  {
    path: "/employee",
    element: <ProtectedRoute allowedRoles={["employee"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          { path: "dashboard", element: <EmployeeDashboard /> },
          { path: "ownProfile", element: <OwnProfile /> },
          { path: "update-profile", element: <UpdateProfile /> },
          { path: "my-team", element: <MyTeam /> },
          { path: "my-tasks", element: <MyTasks /> },
          { path: "my-tasks/:taskId", element: <TaskDetails /> },
          { path: "attendance", element: <MyAttendance /> },
          { path: "leave", element: <MyLeave /> },
          { path: "notifications", element: <Notifications /> },
          { path: "analytics", element: <Analytics /> },
        ],
      },
    ],
  },
]);

export default router;
