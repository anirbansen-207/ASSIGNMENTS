
import crypto from "node:crypto";
import Razorpay from "razorpay";

import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { createTicketService } from "./ticketGenerationService.js";

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error(
      "Razorpay is not configured. Check the backend environment variables.",
    );
    error.statusCode = 500;
    throw error;
  }

  return { keyId, keySecret };
};

const getRazorpay = () => {
  const { keyId, keySecret } = getRazorpayConfig();

  return {
    keyId,
    keySecret,
    client: new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    }),
  };
};

// CREATE RAZORPAY ORDER
export const createPaymentOrderService = async ({
  bookingId,
  customerId,
}) => {
  if (!bookingId || !customerId) {
    const error = new Error("Booking ID and customer ID are required");
    error.statusCode = 400;
    throw error;
  }

  const { keyId, client: razorpayClient } = getRazorpay();

  const booking = await Booking.findOne({
    _id: bookingId,
    customerId,
  });

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  if (booking.status !== "PENDING_PAYMENT") {
    const error = new Error(
      booking.status === "CANCELLED"
        ? "Payment cannot be made for a cancelled booking"
        : "This booking is not awaiting payment",
    );
    error.statusCode = 400;
    throw error;
  }

  // Do not accept payment for an expired seat hold.
  if (!booking.expiresAt || booking.expiresAt <= new Date()) {
    const error = new Error(
      "Your seat hold has expired. Please select your seats and book again.",
    );
    error.statusCode = 409;
    throw error;
  }

  if (booking.totalAmount <= 0) {
    const error = new Error("The booking amount must be greater than zero");
    error.statusCode = 400;
    throw error;
  }

  const existingSuccessfulPayment = await Payment.findOne({
    bookingId,
    customerId,
    paymentStatus: "SUCCESS",
  });

  if (existingSuccessfulPayment) {
    const error = new Error("Payment already exists for this booking");
    error.statusCode = 409;
    throw error;
  }

  // Razorpay expects the amount in paise. ₹500 = 50000 paise.
  const amountInPaise = Math.round(booking.totalAmount * 100);

  if (!Number.isSafeInteger(amountInPaise) || amountInPaise < 100) {
    const error = new Error("The booking amount must be at least ₹1");
    error.statusCode = 400;
    throw error;
  }

  const order = await razorpayClient.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `gb${String(booking._id).slice(-12)}${Date.now()}`,
    notes: {
      bookingId: String(booking._id),
      customerId: String(customerId),
    },
  });

  await Payment.create({
    bookingId: booking._id,
    customerId,
    amount: booking.totalAmount,
    paymentMethod: "RAZORPAY",
    paymentStatus: "PENDING",
    razorpayOrderId: order.id,
  });

  return {
    keyId,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    bookingId: String(booking._id),
  };
};

// VERIFY RAZORPAY PAYMENT AND ENSURE THE TICKET EXISTS
export const verifyPaymentService = async ({
  bookingId,
  customerId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  if (
    !bookingId ||
    !customerId ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    const error = new Error("All payment verification fields are required");
    error.statusCode = 400;
    throw error;
  }

  const {
    keySecret,
    client: razorpayClient,
  } = getRazorpay();

  // Find the order recorded by our backend.
  const payment = await Payment.findOne({
    bookingId,
    customerId,
    razorpayOrderId: razorpay_order_id,
  });

  if (!payment) {
    const error = new Error("Payment order not found for this booking");
    error.statusCode = 404;
    throw error;
  }

  // RECOVERY:
  // Payment may already be successful while ticket creation previously failed.
  // A retry should ensure the ticket exists instead of returning immediately.
  if (
    payment.paymentStatus === "SUCCESS" &&
    payment.razorpayPaymentId === razorpay_payment_id
  ) {
    const ticket = await createTicketService({
      bookingId,
      customerId,
    });

    return {
      ...payment.toObject(),
      ticket,
    };
  }

  if (payment.paymentStatus === "SUCCESS") {
    const error = new Error("This booking already has a successful payment");
    error.statusCode = 409;
    throw error;
  }

  // Verify the signature using the order ID saved by the backend.
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${payment.razorpayOrderId}|${razorpay_payment_id}`)
    .digest("hex");

  const receivedBuffer = Buffer.from(razorpay_signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    const error = new Error("Invalid Razorpay payment signature");
    error.statusCode = 400;
    throw error;
  }

  // Verify the payment directly with Razorpay.
  const razorpayPayment =
    await razorpayClient.payments.fetch(razorpay_payment_id);

  if (razorpayPayment.order_id !== payment.razorpayOrderId) {
    const error = new Error("Razorpay payment does not match this order");
    error.statusCode = 400;
    throw error;
  }

  if (
    razorpayPayment.currency !== "INR" ||
    razorpayPayment.amount !== Math.round(payment.amount * 100)
  ) {
    const error = new Error(
      "Payment amount or currency does not match the booking",
    );
    error.statusCode = 400;
    throw error;
  }

  // This implementation requires automatic payment capture.
  if (razorpayPayment.status !== "captured") {
    const error = new Error("Payment has not been captured yet");
    error.statusCode = 409;
    throw error;
  }

  // Confirm only if the original booking hold is still valid.
  const confirmedBooking = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      customerId,
      status: "PENDING_PAYMENT",
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        status: "CONFIRMED",
        expiresAt: null,
      },
    },
    {
      new: true,
    },
  );

  if (!confirmedBooking) {
    // Money may already have been captured. Preserve its details so
    // support can reconcile the payment; do not falsely mark it failed.
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    const error = new Error(
      "Payment was captured, but the booking could not be confirmed because the hold expired or the booking is no longer pending. The payment requires reconciliation and may need a refund. Please contact support.",
    );
    error.statusCode = 409;
    error.code = "PAYMENT_CAPTURED_BOOKING_NOT_CONFIRMED";
    throw error;
  }

  // Persist payment success BEFORE generating the ticket.
  // If ticket creation fails, the successful payment is retained and
  // the recovery branch above can retry ticket creation safely.
  payment.paymentStatus = "SUCCESS";
  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.transactionId = razorpay_payment_id;

  await payment.save();

  // Generate the ticket on the backend immediately after payment success.
  // createTicketService returns an existing ticket if one already exists.
  const ticket = await createTicketService({
    bookingId,
    customerId,
  });

  return {
    ...payment.toObject(),
    ticket,
  };
};
