import express from "express";
import * as controller from "../controllers/foodController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  foodSchema,
  updateFoodSchema
} from "../validations/schemas.js";

const router = express.Router();

router.get("/", controller.getFoods);

router.post(
  "/",
  protect,
  allowRoles("restaurantOwner"),
  validate(foodSchema),
  controller.createFood
);

router.patch(
  "/:id",
  protect,
  allowRoles("restaurantOwner"),
  validate(updateFoodSchema),
  controller.updateFood
);

router.delete(
  "/:id",
  protect,
  allowRoles("restaurantOwner"),
  controller.deleteFood
);

export default router;