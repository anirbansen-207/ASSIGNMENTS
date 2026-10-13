import express from "express";

import {
  viewAllEmployeesController,
  viewSingleEmployeeController,
  updateEmployeeController,
  assignDepartmentController,
  createEmployeeController,
  deleteEmployeeController,
  assignDesignationController
} from "../controllers/managerController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// View all employees
router.get(
  "/all_employees",
  authMiddleware,
  roleMiddleware(["view_employees"]),
  viewAllEmployeesController
);


// View single employee
router.get(
  "/employee/:id",
  authMiddleware,
  roleMiddleware(["view_single_employee"]),
  viewSingleEmployeeController
);


// Update employee
router.put(
  "/update_employee/:id",
  authMiddleware,
  roleMiddleware(["update_employee"]),
  updateEmployeeController
);


// Assign department
router.patch(
  "/employee/:id/department",
  authMiddleware,
  roleMiddleware(["assign_department"]),
  assignDepartmentController
);

// Assign designation
router.patch(
  "/employee/:id/designation",
  authMiddleware,
  roleMiddleware(["assign_designation"]),
  assignDesignationController
);

// create employee
router.post(
  "/create_employee",
  authMiddleware,
  roleMiddleware(["create_employee"]),
  createEmployeeController
)

// delete employee
router.delete(
  "/employee_delete/:id",
  authMiddleware,
  roleMiddleware(["delete_employee"]),
  deleteEmployeeController
);

export default router;