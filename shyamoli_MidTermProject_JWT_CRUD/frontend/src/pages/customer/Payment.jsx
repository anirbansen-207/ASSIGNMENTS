
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import RouteIcon from "@mui/icons-material/Route";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";

import { toast } from "sonner";

import {
  createPaymentOrder,
  verifyPayment,
} from "../../services/paymentService";

import { createTicket } from "../../services/ticketService";
import { getSingleTrip } from "../../services/tripService";

// Load Razorpay Checkout only when the customer is ready to pay.
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

// Format the journey date without displaying an invalid date.
const formatTravelDate = (dateValue) => {
  if (!dateValue) return "Not available";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Booking passed from the seat-selection page.
  const booking = location.state?.booking;

  // A newly created booking contains tripId as an ID.
  // Fetch the full trip to display its bus and route details.
  const tripId =
    typeof booking?.tripId === "object"
      ? booking.tripId?._id
      : booking?.tripId;

  const {
    data: trip,
    isLoading: tripLoading,
    isError: tripError,
  } = useQuery({
    queryKey: ["payment-trip", tripId],
    queryFn: () => getSingleTrip(tripId),
    enabled: Boolean(tripId),
    retry: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!booking) {
    return (
      <Box>
        <Typography variant="h5">
          Booking information not found.
        </Typography>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/customer/trips")}
        >
          Back to Trips
        </Button>
      </Box>
    );
  }

  const busName = trip?.busId?.busName || "Bus details unavailable";
  const busNumber = trip?.busId?.busNumber || "";
  const sourceCity = trip?.routeId?.sourceCity;
  const destinationCity = trip?.routeId?.destinationCity;

  const travelDate = formatTravelDate(trip?.travelDate);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Create the order on the backend.
      // The backend calculates the amount from MongoDB.
      const order = await createPaymentOrder(booking._id);

      // 2. Load Razorpay Checkout.
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay Checkout. Please check your internet connection.",
        );
      }

      // 3. Configure the Razorpay payment window.
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "GreenBus",
        description: `Bus booking - ${booking.seatNumbers?.join(", ")}`,
        order_id: order.orderId,

        // 4. Razorpay calls this after Checkout returns payment details.
        handler: async (response) => {
          try {
            setLoading(true);
            setError("");

            // 5. Verify payment on the backend.
            // The updated backend should generate the ticket here.
            await verifyPayment({
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment verified successfully!");

            // 6. Keep the existing ticket request for compatibility.
            // If the backend already created the ticket, its service
            // should return that existing ticket instead of duplicating it.
            const ticket = await createTicket(booking._id);

            // Keep the existing ticket route and bookingId query parameter.
            navigate(`/customer/ticket?bookingId=${booking._id}`, {
              state: { ticket },
              replace: true,
            });
          } catch (verificationError) {
            console.error(
              "Payment verification or ticket generation failed:",
              verificationError,
            );

            setError(
              verificationError?.response?.data?.message ||
                verificationError.message ||
                "Payment verification failed. If money was deducted, please contact support.",
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },

        theme: {
          color: "#1976d2",
        },
      };

      const checkout = new window.Razorpay(options);

      // Show a message if Razorpay reports a payment failure.
      checkout.on("payment.failed", (response) => {
        const message =
          response.error?.description ||
          "Payment failed. Please try again.";

        setError(message);
        setLoading(false);
      });

      checkout.open();

      // Checkout is open; its callbacks manage the next steps.
      setLoading(false);
    } catch (paymentError) {
      console.error("Unable to start payment:", paymentError);

      setError(
        paymentError?.response?.data?.message ||
          paymentError.message ||
          "Unable to start payment. Please try again.",
      );

      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 650,
        mx: "auto",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Typography variant="h4" gutterBottom>
        Complete Your Payment
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Review your journey details before proceeding to secure payment.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#071631",
            color: "#fff",
            px: 3,
            py: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <DirectionsBusIcon sx={{ color: "#22c55e", fontSize: 32 }} />

            <Box>
              <Typography variant="h6" fontWeight={700}>
                Booking Summary
              </Typography>

              <Typography variant="body2" sx={{ color: "#d5dced" }}>
                Your GreenBus journey
              </Typography>
            </Box>
          </Stack>
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2.5}>
            {/* Bus details */}
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <DirectionsBusIcon color="primary" sx={{ mt: 0.3 }} />

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Bus Name
                </Typography>

                <Typography fontWeight={600}>
                  {tripLoading ? "Loading bus details..." : busName}
                </Typography>

                {busNumber && (
                  <Typography variant="body2" color="text.secondary">
                    Bus Number: {busNumber}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Divider />

            {/* Route details */}
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <RouteIcon color="primary" sx={{ mt: 0.3 }} />

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Travel Route
                </Typography>

                {sourceCity && destinationCity ? (
                  <Typography fontWeight={600}>
                    {sourceCity} → {destinationCity}
                  </Typography>
                ) : (
                  <Typography>
                    {tripLoading
                      ? "Loading route..."
                      : "Route details unavailable"}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Divider />

            {/* Travel date */}
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <CalendarMonthIcon color="primary" sx={{ mt: 0.3 }} />

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Travel Date
                </Typography>

                <Typography fontWeight={600}>
                  {tripLoading ? "Loading travel date..." : travelDate}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            {/* Booking ID */}
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <ConfirmationNumberIcon
                color="primary"
                sx={{ mt: 0.3 }}
              />

              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  Booking ID
                </Typography>

                <Typography
                  fontWeight={500}
                  sx={{ overflowWrap: "anywhere" }}
                >
                  {booking._id}
                </Typography>
              </Box>
            </Stack>

            {/* Selected seats */}
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <EventSeatIcon color="primary" sx={{ mt: 0.3 }} />

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Selected Seats
                </Typography>

                <Typography fontWeight={600}>
                  {booking.seatNumbers?.length
                    ? booking.seatNumbers.join(", ")
                    : "No seats listed"}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            {/* Total amount */}
            <Box
              sx={{
                backgroundColor: "action.hover",
                borderRadius: 2,
                p: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>

              <Typography variant="h4" fontWeight={700} color="primary.main">
                ₹{Number(booking.totalAmount).toFixed(2)}
              </Typography>
            </Box>

            {tripError && (
              <Alert severity="warning">
                Some trip details could not be loaded. You can retry by
                refreshing this page before making payment.
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary">
              Pay securely using the available payment options in Razorpay
              Checkout.
            </Typography>

            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{ py: 1.3, fontWeight: 700 }}
              onClick={handlePayment}
              disabled={loading || tripLoading || tripError}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={20}
                    color="inherit"
                    sx={{ mr: 1 }}
                  />
                  Processing...
                </>
              ) : (
                `Pay ₹${Number(booking.totalAmount).toFixed(2)}`
              )}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Payment;
