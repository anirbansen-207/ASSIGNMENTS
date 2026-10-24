
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import {
  getOwnBookings,
  cancelBooking,
  getTicket,
} from "../../services/customerService";

const formatDate = (value) => {
  if (!value) return "—";

  const parsedDate = dayjs(value);

  return parsedDate.isValid()
    ? parsedDate.format("DD/MM/YYYY")
    : "—";
};

const MyBookings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [travelDate, setTravelDate] = useState(null);
  const [bookingStatus, setBookingStatus] = useState("ALL");

  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: getOwnBookings,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["my-bookings"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["my-tickets"],
        }),
      ]);
    },
  });

  const ticketMutation = useMutation({
    mutationFn: getTicket,
    onSuccess: (ticket, bookingId) => {
      navigate(`/customer/ticket?bookingId=${bookingId}`, {
        state: { ticket },
      });
    },
  });

  // Match the selected date and status together.
  const filteredBookings = bookings.filter((booking) => {
    const trip = booking.tripId;
    const tripDate = trip?.travelDate;

    const matchesDate =
      !travelDate ||
      (tripDate &&
        dayjs(tripDate).isValid() &&
        dayjs(tripDate).format("YYYY-MM-DD") ===
          travelDate.format("YYYY-MM-DD"));

    const effectiveStatus =
      trip?.tripStatus === "COMPLETED"
        ? "COMPLETED"
        : booking.status;

    const matchesStatus =
      bookingStatus === "ALL" ||
      effectiveStatus === bookingStatus;

    return Boolean(matchesDate) && matchesStatus;
  });

  const resetFilters = () => {
    setTravelDate(null);
    setBookingStatus("ALL");
  };

  if (isLoading) {
    return <Typography>Loading your bookings...</Typography>;
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error?.response?.data?.message ||
          error?.message ||
          "Failed to load your bookings."}
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          My Bookings
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          View and filter your current and previous bus bookings.
        </Typography>

        {cancelMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {cancelMutation.error?.response?.data?.message ||
              "Failed to cancel the booking."}
          </Alert>
        )}

        {ticketMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {ticketMutation.error?.response?.data?.message ||
              "Failed to load the ticket."}
          </Alert>
        )}

        {/* Date and status filters */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Filter Bookings
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
                alignItems: "center",
              }}
            >
              <DatePicker
                label="Travel Date"
                value={travelDate}
                onChange={(newValue) => {
                  setTravelDate(
                    newValue && newValue.isValid() ? newValue : null,
                  );
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: "DD/MM/YYYY",
                  },
                  actionBar: {
                    actions: ["clear", "today", "accept"],
                  },
                }}
              />

              <FormControl fullWidth>
                <InputLabel id="booking-status-label">
                  Booking Status
                </InputLabel>

                <Select
                  labelId="booking-status-label"
                  label="Booking Status"
                  value={bookingStatus}
                  onChange={(event) =>
                    setBookingStatus(event.target.value)
                  }
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="PENDING_PAYMENT">
                    Pending Payment
                  </MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                mt: 2,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={resetFilters}
                disabled={!travelDate && bookingStatus === "ALL"}
              >
                Reset Filters
              </Button>

              <Typography variant="body2" color="text.secondary">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {bookings.length === 0 ? (
          <Card>
            <CardContent>
              <Typography fontWeight={600}>
                You don't have any bookings yet.
              </Typography>

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate("/customer/trips")}
              >
                Book a Ticket
              </Button>
            </CardContent>
          </Card>
        ) : filteredBookings.length === 0 ? (
          <Alert severity="info">
            No bookings match your selected filters. Change the date or
            status, or reset the filters.
          </Alert>
        ) : (
          filteredBookings.map((booking) => {
            const trip = booking.tripId;
            const isCancelled = booking.status === "CANCELLED";
            const isCompleted = trip?.tripStatus === "COMPLETED";

            const effectiveStatus = isCompleted
              ? "COMPLETED"
              : booking.status;

            const statusColor = isCancelled
              ? "error"
              : isCompleted
                ? "default"
                : booking.status === "CONFIRMED"
                  ? "success"
                  : "warning";

            return (
              <Card key={booking._id} sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      {trip?.routeId?.sourceCity || "Source"}
                      {" → "}
                      {trip?.routeId?.destinationCity || "Destination"}
                    </Typography>

                    <Chip
                      label={effectiveStatus || "UNKNOWN"}
                      color={statusColor}
                      size="small"
                    />
                  </Box>

                  <Typography sx={{ mt: 2 }}>
                    <strong>Bus:</strong>{" "}
                    {trip?.busId?.busName || "—"}
                  </Typography>

                  <Typography>
                    <strong>Bus Number:</strong>{" "}
                    {trip?.busId?.busNumber || "—"}
                  </Typography>

                  <Typography>
                    <strong>Seat(s):</strong>{" "}
                    {booking.seatNumbers?.join(", ") || "—"}
                  </Typography>

                  <Typography>
                    <strong>Travel Date:</strong>{" "}
                    {formatDate(trip?.travelDate)}
                  </Typography>

                  <Typography>
                    <strong>Departure:</strong>{" "}
                    {trip?.departureTime || "—"}
                  </Typography>

                  <Typography>
                    <strong>Amount:</strong> ₹{booking.totalAmount ?? 0}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1.5,
                      mt: 3,
                    }}
                  >
                    {!isCancelled && (
                      <Button
                        variant="contained"
                        onClick={() => ticketMutation.mutate(booking._id)}
                        disabled={ticketMutation.isPending}
                      >
                        {ticketMutation.isPending
                          ? "Loading Ticket..."
                          : "View Ticket"}
                      </Button>
                    )}

                    {!isCancelled && !isCompleted && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          const confirmed = window.confirm(
                            "Are you sure you want to cancel this booking?",
                          );

                          if (confirmed) {
                            cancelMutation.mutate(booking._id);
                          }
                        }}
                        disabled={cancelMutation.isPending}
                      >
                        {cancelMutation.isPending
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default MyBookings;
