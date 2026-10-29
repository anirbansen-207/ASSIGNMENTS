import express from "express";
import Joi from "joi";
import * as controller from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

const addSchema = Joi.object({
  foodId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).max(99).required()
});

const updateSchema = Joi.object({
  quantity: Joi.number().integer().min(0).max(99).required()
});

router.use(protect, allowRoles("user"));

router.get("/", controller.getCart);
router.post("/items", validate(addSchema), controller.addToCart);
router.patch("/items/:foodId", validate(updateSchema), controller.updateCartItem);
router.delete("/items/:foodId", controller.removeCartItem);
router.delete("/", controller.clearCart);

export default router;