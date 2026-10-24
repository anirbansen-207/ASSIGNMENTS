import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import { getSingleBooking } from "../../services/adminBookingService";

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleDateString();
};

const formatTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
};

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  // Fetch the selected booking using its ID.
  const {
    data: booking,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getSingleBooking(bookingId),
    enabled: Boolean(bookingId),
  });

  if (isLoading) {
    return <Typography>Loading booking...</Typography>;
  }

  if (isError) {
    return (
      <Typography color="error">
        Failed to load booking: {error.message}
      </Typography>
    );
  }

  if (!booking) {
    return <Typography>Booking not found.</Typography>;
  }

  const trip = booking.tripId;
  const route = trip?.routeId;
  const bus = trip?.busId;
  const driver = trip?.driverId;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Booking Details
      </Typography>

      <Card sx={{ maxWidth: 700 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Booking ID: {booking._id}
          </Typography>

          <Stack spacing={1}>
            <Typography>
              <strong>Customer:</strong>{" "}
              {booking.customerId?.name || "N/A"}
            </Typography>

            <Typography>
              <strong>Email:</strong>{" "}
              {booking.customerId?.email || "N/A"}
            </Typography>

            <Typography>
              <strong>Route:</strong>{" "}
              {route?.sourceCity || "N/A"} →{" "}
              {route?.destinationCity || "N/A"}
            </Typography>

            <Typography>
              <strong>Bus Name:</strong>{" "}
              {bus?.busName || "N/A"}
            </Typography>

            <Typography>
              <strong>Bus Number:</strong>{" "}
              {bus?.busNumber || "N/A"}
            </Typography>

            <Typography>
              <strong>Bus Type:</strong>{" "}
              {bus?.busType || "N/A"}
            </Typography>

            <Typography>
              <strong>Travel Date:</strong>{" "}
              {formatDate(trip?.travelDate)}
            </Typography>

            <Typography>
              <strong>Departure:</strong>{" "}
              {formatTime(trip?.departureTime)}
            </Typography>

            <Typography>
              <strong>Arrival:</strong>{" "}
              {formatTime(trip?.arrivalTime)}
            </Typography>

            <Typography>
              <strong>Driver:</strong>{" "}
              {driver?.name || "N/A"}
            </Typography>

            <Typography>
              <strong>Seats:</strong>{" "}
              {booking.seatNumbers?.join(", ") || "N/A"}
            </Typography>

            <Typography>
              <strong>Ticket Price:</strong>{" "}
              {booking.ticketPrice != null
                ? `₹${booking.ticketPrice}`
                : "N/A"}
            </Typography>

            <Typography>
              <strong>Total Amount:</strong>{" "}
              {booking.totalAmount != null
                ? `₹${booking.totalAmount}`
                : "N/A"}
            </Typography>

            <Typography>
              <strong>Status:</strong>{" "}
              {booking.status || "N/A"}
            </Typography>
          </Stack>

          <Button
            sx={{ mt: 2 }}
            variant="outlined"
            onClick={() => navigate("/super-admin/bookings")}
          >
            Back to Bookings
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookingDetails;