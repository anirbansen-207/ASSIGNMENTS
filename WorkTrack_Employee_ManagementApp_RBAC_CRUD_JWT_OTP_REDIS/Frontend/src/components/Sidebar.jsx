
import {
  Assessment,
  Assignment,
  Business,
  CalendarMonth,
  Dashboard,
  Group,
  Groups,
  History,
  Logout,
  Notifications,
  People,
  Person,
  Schedule,
  Task,
} from "@mui/icons-material";

import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const drawerWidth = 250;

const menuByRole = {
  admin: [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <Dashboard />,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: <People />,
    },
    {
      label: "Departments",
      path: "/admin/departments",
      icon: <Business />,
    },
    {
      label: "Create Manager",
      path: "/admin/create-manager",
      icon: <Person />,
    },
    {
      label: "Teams",
      path: "/admin/teams",
      icon: <Groups />,
    },
    {
      label: "Tasks",
      path: "/admin/tasks",
      icon: <Assignment />,
    },
    {
      label: "Attendance",
      path: "/admin/attendance",
      icon: <Schedule />,
    },
    {
      label: "Leave",
      path: "/admin/leave",
      icon: <CalendarMonth />,
    },
    {
      label: "Notifications",
      path: "/admin/notifications",
      icon: <Notifications />,
    },
    {
      label: "Activity Feed",
      path: "/admin/activity-feed",
      icon: <History />,
    },
    {
      label: "Analytics",
      path: "/admin/analytics",
      icon: <Assessment />,
    },
  ],

  manager: [
    {
      label: "Dashboard",
      path: "/manager/dashboard",
      icon: <Dashboard />,
    },
    {
      label: "Departments",
      path: "/manager/departments",
      icon: <Business />,
    },
    {
      label: "Create Employee",
      path: "/manager/create-employee",
      icon: <Person />,
    },
    {
      label: "Employees",
      path: "/manager/employees",
      icon: <People />,
    },
    {
      label: "Assign Department",
      path: "/manager/assign-department",
      icon: <Business />,
    },
    {
      label: "Assign Designation",
      path: "/manager/assign-designation",
      icon: <Person />,
    },
    {
      label: "Teams",
      path: "/manager/teams",
      icon: <Groups />,
    },
    {
      label: "Tasks",
      path: "/manager/tasks",
      icon: <Assignment />,
    },
    {
      label: "Attendance",
      path: "/manager/attendance",
      icon: <Schedule />,
    },
    {
      label: "Leave Requests",
      path: "/manager/leave",
      icon: <CalendarMonth />,
    },
    {
      label: "Leave Calendar",
      path: "/manager/leave-calendar",
      icon: <CalendarMonth />,
    },
    {
      label: "Notifications",
      path: "/manager/notifications",
      icon: <Notifications />,
    },
    {
      label: "Analytics",
      path: "/manager/analytics",
      icon: <Assessment />,
    },
  ],

  employee: [
    {
      label: "Dashboard",
      path: "/employee/dashboard",
      icon: <Dashboard />,
    },
    {
      label: "My Profile",
      path: "/employee/ownProfile",
      icon: <Person />,
    },
    {
      label: "Update Profile",
      path: "/employee/update-profile",
      icon: <Person />,
    },
    {
      label: "My Team",
      path: "/employee/my-team",
      icon: <Group />,
    },
    {
      label: "My Tasks",
      path: "/employee/my-tasks",
      icon: <Task />,
    },
    {
      label: "Attendance",
      path: "/employee/attendance",
      icon: <Schedule />,
    },
    {
      label: "Leave",
      path: "/employee/leave",
      icon: <CalendarMonth />,
    },
    {
      label: "Notifications",
      path: "/employee/notifications",
      icon: <Notifications />,
    },
    {
      label: "Analytics",
      path: "/employee/analytics",
      icon: <Assessment />,
    },
  ],
};

function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const menuItems = menuByRole[user?.role] || [];

  const drawerContent = (
    <Box
      sx={{
        width: drawerWidth,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h5" fontWeight={700}>
          WorkTrack
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            textTransform: "capitalize",
          }}
        >
          {user?.role || "User"} Dashboard
        </Typography>
      </Box>

      <Divider />

      <List
        sx={{
          px: 1,
          py: 1,
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={onClose}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              "&.active": {
                backgroundColor: "action.selected",
              },
              "&.active .MuiListItemIcon-root": {
                color: "primary.main",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>

            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <Stack sx={{ p: 1 }}>
        <ListItemButton
          onClick={logout}
          sx={{ borderRadius: 1.5 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Logout />
          </ListItemIcon>

          <ListItemText primary="Logout" />
        </ListItemButton>
      </Stack>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export { drawerWidth };
export default Sidebar;
