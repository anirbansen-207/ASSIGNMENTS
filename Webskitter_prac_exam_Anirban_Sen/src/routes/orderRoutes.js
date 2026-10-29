import express from "express";
import * as controller from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  orderCreateSchema,
  orderStatusSchema
} from "../validations/schemas.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  allowRoles("user"),
  validate(orderCreateSchema),
  controller.createOrder
);

router.get(
  "/my",
  allowRoles("user"),
  controller.getMyOrders
);

router.get(
  "/restaurant",
  allowRoles("restaurantOwner"),
  controller.getRestaurantOrders
);

router.get(
  "/all",
  allowRoles("admin"),
  controller.getAllOrders
);

router.patch(
  "/:id/cancel",
  allowRoles("user"),
  controller.cancelOrder
);

router.patch(
  "/:id/status",
  allowRoles("restaurantOwner"),
  validate(orderStatusSchema),
  controller.updateOrderStatus
);

export default router;