
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { getSingleBus } from "../../services/busService";
import { createSeatLayout } from "../../services/seatLayoutService";
import BusSeatMap from "../../components/BusSeatMap";

const AddSeatLayout = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);

  const {
    data: bus,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["bus", busId],
    queryFn: () => getSingleBus(busId),
    enabled: Boolean(busId),
  });

  useEffect(() => {
    if (!bus) return;

    const isSleeper = bus.busType === "SLEEPER";

    const generatedSeats = Array.from(
      { length: Number(bus.totalSeats) || 0 },
      (_, index) => {
        const berthNumber = Math.floor(index / 2) + 1;
        const isUpper = index % 2 === 0;

        return {
          seatNumber: isSleeper
            ? `${berthNumber}${isUpper ? "U" : "L"}`
            : String(index + 1),
          seatType: "regular",
          berthLevel: isSleeper
            ? isUpper
              ? "upper"
              : "lower"
            : null,
        };
      },
    );

    setSeats(generatedSeats);
  }, [bus]);

  const mutation = useMutation({
    mutationFn: createSeatLayout,
    onSuccess: () => {
      toast.success("Seat layout created successfully");

      // Correct route: router.jsx defines "seat-layouts".
      navigate("/super-admin/seat-layouts");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to create seat layout",
      );
    },
  });

  const handleSeatTypeChange = (seatNumber, seatType) => {
    setSeats((previous) =>
      previous.map((seat) =>
        seat.seatNumber === seatNumber
          ? { ...seat, seatType }
          : seat,
      ),
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate({ busId, seats });
  };

  if (isLoading) {
    return <Typography>Loading bus details...</Typography>;
  }

  if (isError) {
    return (
      <Typography color="error">
        Failed to load bus: {error?.message || "Unknown error"}
      </Typography>
    );
  }

  if (!bus) {
    return <Typography color="error">Bus not found.</Typography>;
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create Seat Layout
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">{bus.busName}</Typography>
          <Typography>Bus Number: {bus.busNumber}</Typography>
          <Typography>Bus Type: {bus.busType}</Typography>
          <Typography>Total Seats/Berths: {bus.totalSeats}</Typography>
          <Typography>Ticket Price: ₹{bus.ticketPrice}</Typography>
        </CardContent>
      </Card>

      <Typography
        variant="body2"
        color="text.secondary"
        mb={2}
      >
        {bus.busType === "SLEEPER"
          ? "Each sleeper berth has an independent upper or lower position."
          : "Each row has two seats on either side of the aisle, with four seats at the rear."}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <BusSeatMap
          seats={seats}
          busType={bus.busType}
          admin
          onSeatTypeChange={handleSeatTypeChange}
        />

        <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending || seats.length === 0}
          >
            {mutation.isPending
              ? "Creating..."
              : "Create Seat Layout"}
          </Button>

          <Button
            type="button"
            variant="outlined"
            onClick={() => navigate("/super-admin/seat-layouts")}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddSeatLayout;
