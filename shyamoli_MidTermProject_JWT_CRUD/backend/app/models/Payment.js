
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: [
        "CARD",
        "UPI",
        "NET_BANKING",
        "CASH",
        "RAZORPAY",
      ],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    // Razorpay order created by the backend.
    razorpayOrderId: {
      type: String,
      sparse: true,
    },

    // Payment ID returned after the customer pays.
    razorpayPaymentId: {
      type: String,
      sparse: true,
    },

    // Signature returned by Razorpay Checkout.
    razorpaySignature: {
      type: String,
    },

    // Kept for compatibility with the existing model.
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  },
);

// Only one successful payment per booking.
paymentSchema.index(
  { bookingId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      paymentStatus: "SUCCESS",
    },
  },
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
