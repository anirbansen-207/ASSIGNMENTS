
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { toast } from "sonner";

import {
  getAvailableSeats,
  createBooking,
} from "../../services/bookingService";
import BusSeatMap from "../../components/BusSeatMap";

const SeatSelection = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["available-seats", tripId],
    queryFn: () => getAvailableSeats(tripId),
    enabled: Boolean(tripId),
  });

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (booking) => {
      navigate("/customer/payment", { state: { booking } });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Booking failed");
    },
  });

  if (isLoading) return <Typography>Loading available seats...</Typography>;

  if (isError) {
    return (
      <Typography color="error">
        Failed to load seats: {error?.message}
      </Typography>
    );
  }

  // Supports both the updated response and the older array response.
  const seats = Array.isArray(data) ? data : data?.seats || [];
  const busType = Array.isArray(data) ? null : data?.busType;

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    setSelectedSeats((previous) =>
      previous.includes(seat.seatNumber)
        ? previous.filter((number) => number !== seat.seatNumber)
        : [...previous, seat.seatNumber],
    );
  };

  const handleContinue = () => {
    if (!selectedSeats.length) {
      toast.error("Please select at least one seat or berth");
      return;
    }

    bookingMutation.mutate({
      tripId,
      seatNumbers: selectedSeats,
    });
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Select Your Seats
      </Typography>

      <Typography color="text.secondary" mb={3}>
        {busType === "SLEEPER"
          ? "Choose an available upper or lower berth."
          : "Choose available seats from the bus layout."}
      </Typography>

      <BusSeatMap
        seats={seats}
        busType={busType}
        selectedSeats={selectedSeats}
        onSeatClick={handleSeatClick}
      />

      <Typography sx={{ mt: 3 }}>
        Selected: {selectedSeats.length ? selectedSeats.join(", ") : "None"}
      </Typography>

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        disabled={!selectedSeats.length || bookingMutation.isPending}
        onClick={handleContinue}
      >
        {bookingMutation.isPending ? "Creating Booking..." : "Continue"}
      </Button>
    </Box>
  );
};

export default SeatSelection;
