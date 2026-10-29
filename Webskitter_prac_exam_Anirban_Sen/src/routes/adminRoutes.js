import express from "express";
import * as controller from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { roleSchema, blockUserSchema } from "../validations/schemas.js";

const router = express.Router();

router.use(protect, allowRoles("admin"));

router.get("/users", controller.getUsers);

router.patch(
  "/users/:id/role",
  validate(roleSchema),
  controller.updateUserRole
);

router.patch(
  "/users/:id/block",
  validate(blockUserSchema),
  controller.blockUser
);

router.get("/restaurants", controller.getRestaurants);
router.get("/orders", controller.getOrders);
router.get("/statistics", controller.getStatistics);

export default router;