
import express from "express";

import {
  createPaymentOrderController,
  verifyPaymentController,
} from "../controllers/paymentController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { ROLES } from "../utils/roles.js";
import { validateMiddleware } from "../middlewares/validationMiddleware.js";

import {
  createPaymentSchema,
  verifyPaymentSchema,
} from "../validations/paymentValidation.js";

const router = express.Router();

// Create a Razorpay order.
router.post(
  "/create_order",
  authMiddleware,
  roleMiddleware([ROLES.CUSTOMER]),
  validateMiddleware(createPaymentSchema),
  createPaymentOrderController,
);

// Verify a completed Razorpay Checkout payment.
router.post(
  "/verify_payment",
  authMiddleware,
  roleMiddleware([ROLES.CUSTOMER]),
  validateMiddleware(verifyPaymentSchema),
  verifyPaymentController,
);

export default router;
