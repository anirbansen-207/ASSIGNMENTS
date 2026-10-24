
import axiosInstance from "./axios";

// Ask the backend to create a Razorpay order.
export const createPaymentOrder = async (bookingId) => {
  const response = await axiosInstance.post(
    "/api/payment/create_order",
    { bookingId },
  );

  return response.data.data;
};

// Ask the backend to verify Razorpay's Checkout response.
export const verifyPayment = async (paymentData) => {
  const response = await axiosInstance.post(
    "/api/payment/verify_payment",
    paymentData,
  );

  return response.data.data;
};
