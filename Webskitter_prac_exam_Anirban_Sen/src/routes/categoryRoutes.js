import express from "express";
import * as controller from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  categorySchema,
  updateCategorySchema
} from "../validations/schemas.js";

const router = express.Router();

router.get("/", controller.getCategories);

router.post(
  "/",
  protect,
  allowRoles("admin"),
  validate(categorySchema),
  controller.createCategory
);

router.patch(
  "/:id",
  protect,
  allowRoles("admin"),
  validate(updateCategorySchema),
  controller.updateCategory
);

router.delete(
  "/:id",
  protect,
  allowRoles("admin"),
  controller.deleteCategory
);

export default router;