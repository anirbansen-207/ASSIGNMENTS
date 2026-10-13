import express from "express";
import {
  viewOwnProfileController,
  updateOwnProfileController,
} from "../controllers/employeeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import middlewareValidation from "../middleware/validateMiddleware.js";
import { updateEmployeeSchema } from "../validations/employeevalidation.js";


const router = express.Router();

// view own profile
router.get(
  "/viewOwnProfile",
  authMiddleware,
  roleMiddleware(["view_own_profile"]),
  viewOwnProfileController,
);


// update own profile
router.put(
  "/updateOwnProfile",
  authMiddleware,
  roleMiddleware(["update_own_profile"]),
  middlewareValidation(updateEmployeeSchema),
  updateOwnProfileController,
);
export default router;
