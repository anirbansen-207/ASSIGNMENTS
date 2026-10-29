import express from "express";
import Joi from "joi";
import * as restaurantController from "../controllers/restaurantController.js";
import * as foodController from "../controllers/foodController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  updateRestaurantSchema
} from "../validations/schemas.js";

const router = express.Router();

router.use(protect, allowRoles("restaurantOwner"));

router.post(
  "/restaurants",
  restaurantController.createRestaurant
);

router.get("/restaurants", restaurantController.getOwnerRestaurants);
router.get("/foods", foodController.getOwnerFoods);

router.patch(
  "/restaurants/:id",
  validate(updateRestaurantSchema),
  restaurantController.updateRestaurant
);

router.patch(
  "/restaurants/:id/status",
  validate(
    Joi.object({
      isActive: Joi.boolean().required()
    })
  ),
  restaurantController.changeRestaurantStatus
);

export default router;