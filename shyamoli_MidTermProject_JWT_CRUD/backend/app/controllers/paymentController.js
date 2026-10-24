
import {
  createPaymentOrderService,
  verifyPaymentService,
} from "../services/paymentService.js";

import { successResponse } from "../utils/response.js";

// Create a Razorpay order for the authenticated customer.
export const createPaymentOrderController = async (
  req,
  res,
  next,
) => {
  try {
    const { userId: customerId } = req.user;
    const { bookingId } = req.body;

    const order = await createPaymentOrderService({
      bookingId,
      customerId,
    });

    return successResponse(
      res,
      200,
      "Payment order created successfully",
      order,
    );
  } catch (error) {
    next(error);
  }
};

// Verify Razorpay Checkout response on the backend.
export const verifyPaymentController = async (
  req,
  res,
  next,
) => {
  try {
    const { userId: customerId } = req.user;

    const payment = await verifyPaymentService({
      ...req.body,
      customerId,
    });

    return successResponse(
      res,
      200,
      "Payment verified successfully",
      payment,
    );
  } catch (error) {
    next(error);
  }
};
