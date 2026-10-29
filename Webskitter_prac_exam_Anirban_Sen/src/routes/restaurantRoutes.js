import express from "express";
import * as controller from "../controllers/restaurantController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { restaurantSchema } from "../validations/schemas.js";

const router = express.Router();

router.get("/", controller.getRestaurants);
router.get("/:id", controller.getRestaurant);

router.post(
  "/",
  protect,
  allowRoles("restaurantOwner"),
  validate(restaurantSchema),
  controller.createRestaurant
);

export default router;