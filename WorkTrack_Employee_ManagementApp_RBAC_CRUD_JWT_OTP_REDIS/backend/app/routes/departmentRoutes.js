import express from "express";

import {
  createDepartmentController,
  viewAllDepartmentsController,
  viewSingleDepartmentController,
  updateDepartmentController,
  deleteDepartmentController,
} from "../controllers/departmentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import middlewareValidation from "../middleware/validateMiddleware.js";

import {
  createDepartmentValidation,
  updateDepartmentValidation,
} from "../validations/departmentValidation.js";

const router = express.Router();

// Create department
router.post(
  "/create-department",
  authMiddleware,
  roleMiddleware(["create_department"]),
  middlewareValidation(createDepartmentValidation),
  createDepartmentController,
);

// View all departments
router.get(
  "/view-department",
  authMiddleware,
  roleMiddleware(["view_departments"]),
  viewAllDepartmentsController,
);

// View single department
router.get(
  "/view-department/:id",
  authMiddleware,
  roleMiddleware(["view_departments"]),
  viewSingleDepartmentController,
);

// Update department
router.put(
  "/update-department/:id",
  authMiddleware,
  roleMiddleware(["update_department"]),
  middlewareValidation(updateDepartmentValidation),
  updateDepartmentController,
);

// Delete department
router.delete(
  "/delete-department/:id",
  authMiddleware,
  roleMiddleware(["delete_department"]),
  deleteDepartmentController,
);

export default router;