import express from "express";

import {
  createTeamController,
  viewAllTeamsController,
  viewSingleTeamController,
  updateTeamController,
  deleteTeamController,
  addTeamMemberController,
  removeTeamMemberController,
  viewTeamMembersController,
  viewMyTeamController,
  viewMyTeamMembersController,
} from "../controllers/teamController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/* =========================================================
   EMPLOYEE — MY TEAM
========================================================= */

router.get(
  "/my-team",
  authMiddleware,
  roleMiddleware(["view_my_team"]),
  viewMyTeamController,
);

router.get(
  "/my-team/members",
  authMiddleware,
  roleMiddleware(["view_my_team_members"]),
  viewMyTeamMembersController,
);


/* =========================================================
   TEAM MANAGEMENT
========================================================= */

// Create a team
router.post(
  "/create-team",
  authMiddleware,
  roleMiddleware(["create_team"]),
  createTeamController,
);

// View all teams
router.get(
  "/all-teams",
  authMiddleware,
  roleMiddleware(["view_teams"]),
  viewAllTeamsController,
);

// View single team
router.get(
  "/team-details/:teamId",
  authMiddleware,
  roleMiddleware(["view_single_team"]),
  viewSingleTeamController,
);

// Update team
router.put(
  "/update-team/:teamId",
  authMiddleware,
  roleMiddleware(["update_team"]),
  updateTeamController,
);

// Delete team
router.delete(
  "/delete-team/:teamId",
  authMiddleware,
  roleMiddleware(["delete_team"]),
  deleteTeamController);


/* =========================================================
   TEAM MEMBERS
========================================================= */

// Add employee to team
router.patch(
  "/add-member/:teamId/:employeeId",
  authMiddleware,
  roleMiddleware(["add_team_member"]),
  addTeamMemberController,
);

// Remove employee from team
router.delete(
  "/remove-member/:teamId/:employeeId",
  authMiddleware,
  roleMiddleware(["remove_team_member"]),
  removeTeamMemberController,
);

// View team members
router.get(
  "/team-members/:teamId",
  authMiddleware,
  roleMiddleware(["view_team_members"]),
  viewTeamMembersController,
);

export default router;