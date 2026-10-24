import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import {
  getAllBookings,
  cancelBooking,
} from "../../services/adminBookingService";

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

const Bookings = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch all bookings.
  const {
    data: bookings,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: getAllBookings,
  });

  // Cancel a booking and refresh the booking list.
  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
    },
  });

  const handleCancel = (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) return;

    cancelMutation.mutate(bookingId);
  };

  if (isLoading) {
    return <Typography>Loading bookings...</Typography>;
  }

  if (isError) {
    return (
      <Typography color="error">
        Failed to load bookings: {error.message}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Booking Management
      </Typography>

      {!bookings || bookings.length === 0 ? (
        <Typography>No bookings found.</Typography>
      ) : (
        bookings.map((booking) => {
          const trip = booking.tripId;
          const route = trip?.routeId;
          const bus = trip?.busId;

          return (
            <Card key={booking._id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking ID: {booking._id}
                </Typography>

                <Stack spacing={0.75}>
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
                    <strong>Customer:</strong>{" "}
                    {booking.customerId?.name || "N/A"}
                  </Typography>

                  <Typography>
                    <strong>Seats:</strong>{" "}
                    {booking.seatNumbers?.join(", ") || "N/A"}
                  </Typography>

                  <Typography>
                    <strong>Status:</strong>{" "}
                    {booking.status || "N/A"}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Button
                  variant="outlined"
                  sx={{ mr: 2, mb: { xs: 1, sm: 0 } }}
                  onClick={() =>
                    navigate(`/super-admin/bookings/${booking._id}`)
                  }
                >
                  View Details
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  disabled={
                    cancelMutation.isPending ||
                    booking.status === "CANCELLED"
                  }
                  onClick={() => handleCancel(booking._id)}
                >
                  Cancel Booking
                </Button>
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );
};

export default Bookings;