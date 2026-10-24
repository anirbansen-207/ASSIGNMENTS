
import Joi from "joi";

export const createPaymentSchema = Joi.object({
  bookingId: Joi.string().hex().length(24).required(),
});

export const verifyPaymentSchema = Joi.object({
  bookingId: Joi.string().hex().length(24).required(),

  razorpay_order_id: Joi.string().required(),

  razorpay_payment_id: Joi.string().required(),

  razorpay_signature: Joi.string()
    .hex()
    .length(64)
    .required(),
});
