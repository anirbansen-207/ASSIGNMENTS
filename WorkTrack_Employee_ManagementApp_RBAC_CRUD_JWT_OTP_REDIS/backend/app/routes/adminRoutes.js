import express from "express";

import {
  createManagerController,
  updateManagerController,
  deleteManagerController,
  viewAllUsersController,
  updateEmployeeController,
  deleteEmployeeController,
  viewSingleManagerController,
  viewSingleEmployeeController
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// Create Manager
router.post(
  "/create_manager",
  authMiddleware,
  roleMiddleware(["create_manager"]),
  createManagerController
);

// View single Manager
router.get(
  "/view_manager/:id",
  authMiddleware,
  roleMiddleware(["view_single_manager"]),
  viewSingleManagerController
);


// Update Manager
router.put(
  "/update_manager/:id",
  authMiddleware,
  roleMiddleware(["update_manager"]),
  updateManagerController
);


// Delete Manager
router.delete(
  "/delete_manager/:id",
  authMiddleware,
  roleMiddleware(["delete_manager"]),
  deleteManagerController
);


// View All Users
router.get(
  "/users",
  authMiddleware,
  roleMiddleware(["view_all_users"]),
  viewAllUsersController
);

// view single employee
router.get(
  "/employee/:id",
  authMiddleware,
  roleMiddleware(["view_single_employee"]),
  viewSingleEmployeeController
);


// Update Employee
router.put(
  "/employee_update/:id",
  authMiddleware,
  roleMiddleware(["update_employee"]),
  updateEmployeeController
);


// Delete Employee
router.delete(
  "/employee_delete/:id",
  authMiddleware,
  roleMiddleware(["delete_employee"]),
  deleteEmployeeController
);

export default router;