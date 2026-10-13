
const roles = {
  admin: [
    // Auth permissions
    "create_manager",
    "delete_manager",
    "update_manager",
    "view_all_users",
    "delete_employee",
    "update_employee",
    "view_single_manager",
    "view_single_employee",

    // Department permissions
    "create_department",
    "view_departments",
    "update_department",
    "delete_department",

    // Team permissions
    "create_team",
    "view_teams",
    "view_single_team",
    "update_team",
    "delete_team",
    "add_team_member",
    "remove_team_member",
    "view_team_members",
    "view_team_work",

    // Task permissions
    "create_task",
    "view_tasks",
    "view_task",
    "update_task",
    "delete_task",
    "view_team_tasks",
    "update_task_status",
    "update_task_progress",

    // Task comments
    "create_task_comment",
    "view_task_comments",

    // Task activity
    "view_task_activity",

    // Attendance permissions
    "view_all_attendance",
    "correct_attendance",

    // Leave permissions
    "view_all_leave",
    "manage_leave_balance",
    "view_leave_calendar",

    // Notification permissions
    "view_notifications",
    "manage_notifications",

    // Admin activity feed
    "view_admin_activity",

    // Analytics permissions
    "view_analytics",

    // Extra Work Permissions
    "view_all_extra_work",
  ],

  manager: [
    // Auth permissions
    "create_employee",
    "delete_employee",
    "view_employees",
    "view_single_employee",
    "update_employee",
    "assign_department",
    "assign_designation",

    // Department permissions
    "view_departments",

    // Team permissions
    "create_team",
    "view_teams",
    "view_single_team",
    "update_team",
    "delete_team",
    "add_team_member",
    "remove_team_member",
    "view_team_members",
    "view_team_work",

    // Task permissions
    "create_task",
    "view_tasks",
    "view_task",
    "update_task",
    "delete_task",
    "view_team_tasks",
    "update_task_status",
    "update_task_progress",

    // Task comments
    "create_task_comment",
    "view_task_comments",

    // Task activity
    "view_task_activity",

    // Attendance permissions
    "view_team_attendance",

    // Leave permissions
    "view_team_leave",
    "review_leave",
    "view_team_leave_calendar",

    // Notification permissions
    "view_notifications",
    "manage_notifications",

    // Analytics permissions
    "view_analytics",

    // Extra work permissions
    "review_extra_work",
    "assign_extra_work",
  ],

  employee: [
    // Auth permissions
    "view_own_profile",
    "update_own_profile",

    // Team permissions
    "view_my_team",
    "view_my_team_members",
    "view_my_team_work",

    // Task permissions
    "view_my_tasks",
    "view_my_team_tasks",
    "view_task",
    "update_task_status",
    "update_task_progress",

    // Task comments
    "create_task_comment",
    "view_task_comments",

    // Task activity
    "view_task_activity",

    // Attendance permissions
    "check_in",
    "check_out",
    "start_attendance_break",
    "end_attendance_break",
    "view_my_attendance",

    // Leave permissions
    "create_leave",
    "view_my_leave",
    "view_my_leave_balance",

    // Notification permissions
    "view_notifications",
    "manage_notifications",

    // Analytics permissions
    "view_analytics",

    // Extra work permissions
    "request_extra_work",
    "view_my_extra_work",
    "checkout_extra_work",
  ],
};

export default roles;
