
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { toast } from "sonner";

import {
  getAllCustomersForBooking,
  getAllTripsForBooking,
  getAvailableSeatsForBooking,
  createOfflineBooking,
} from "../../services/offlineBookingService";

import BusSeatMap from "../../components/BusSeatMap";

const CreateOfflineBooking = () => {
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState("");
  const [tripId, setTripId] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["booking-staff-customers"],
    queryFn: getAllCustomersForBooking,
  });

  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ["booking-staff-trips"],
    queryFn: getAllTripsForBooking,
  });

  const {
    data: seatData,
    isLoading: seatsLoading,
    isError: seatsError,
  } = useQuery({
    queryKey: ["booking-staff-seats", tripId],
    queryFn: () => getAvailableSeatsForBooking(tripId),
    enabled: Boolean(tripId),
  });

  const bookingMutation = useMutation({
    mutationFn: createOfflineBooking,

    onSuccess: () => {
      toast.success("Offline booking created successfully");

      queryClient.invalidateQueries({
        queryKey: ["booking-staff-seats", tripId],
      });

      setCustomerId("");
      setTripId("");
      setSelectedSeats([]);
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to create booking",
      );
    },
  });

  const seats = Array.isArray(seatData)
    ? seatData
    : seatData?.seats || [];

  const busType = Array.isArray(seatData) ? null : seatData?.busType;

  const handleTripChange = (event) => {
    setTripId(event.target.value);
    setSelectedSeats([]);
  };

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    setSelectedSeats((previous) =>
      previous.includes(seat.seatNumber)
        ? previous.filter((number) => number !== seat.seatNumber)
        : [...previous, seat.seatNumber],
    );
  };

  const handleCreateBooking = () => {
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (!tripId) {
      toast.error("Please select a trip");
      return;
    }

    if (!selectedSeats.length) {
      toast.error("Please select at least one seat or berth");
      return;
    }

    bookingMutation.mutate({
      customerId,
      tripId,
      seatNumbers: selectedSeats,
    });
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Create Offline Booking
      </Typography>

      <Card>
        <CardContent>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="offline-customer-label">
              Select Customer
            </InputLabel>

            <Select
              labelId="offline-customer-label"
              value={customerId}
              label="Select Customer"
              onChange={(event) => setCustomerId(event.target.value)}
              disabled={customersLoading}
            >
              {customers.map((customer) => (
                <MenuItem key={customer._id} value={customer._id}>
                  {customer.name} — {customer.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="offline-trip-label">Select Trip</InputLabel>

            <Select
              labelId="offline-trip-label"
              value={tripId}
              label="Select Trip"
              onChange={handleTripChange}
              disabled={tripsLoading}
            >
              {trips
                .filter((trip) => trip.tripStatus === "SCHEDULED")
                .map((trip) => (
                  <MenuItem key={trip._id} value={trip._id}>
                    {trip.routeId?.sourceCity} → {trip.routeId?.destinationCity}
                    {" — "}
                    {new Date(trip.travelDate).toLocaleDateString()}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {tripId && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" mb={2}>
                Select Seats / Berths
              </Typography>

              {seatsLoading ? (
                <CircularProgress size={28} />
              ) : seatsError ? (
                <Typography color="error">
                  Unable to load seats for this trip.
                </Typography>
              ) : seats.length === 0 ? (
                <Typography color="text.secondary">
                  No seats available.
                </Typography>
              ) : (
                <BusSeatMap
                  seats={seats}
                  busType={busType}
                  selectedSeats={selectedSeats}
                  onSeatClick={handleSeatClick}
                />
              )}
            </Box>
          )}

          <Typography mb={2}>
            Selected: {selectedSeats.length ? selectedSeats.join(", ") : "None"}
          </Typography>

          <Button
            variant="contained"
            onClick={handleCreateBooking}
            disabled={
              bookingMutation.isPending ||
              !tripId ||
              seatsLoading ||
              seatsError
            }
          >
            {bookingMutation.isPending
              ? "Creating Booking..."
              : "Create Booking"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateOfflineBooking;
