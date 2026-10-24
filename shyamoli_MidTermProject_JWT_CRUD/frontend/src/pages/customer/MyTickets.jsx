
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";

import { getOwnBookings, getTicket } from "../../services/customerService";

import { downloadTicketPdf } from "../../utils/ticketPdf";

const formatDate = (value) => {
  if (!value) return "—";

  const parsedDate = dayjs(value);

  return parsedDate.isValid() ? parsedDate.format("DD/MM/YYYY") : "—";
};

const formatTime = (value) => {
  if (!value) return "—";

  const parsedDate = dayjs(value);

  return parsedDate.isValid() ? parsedDate.format("hh:mm A") : "—";
};

const MyTickets = () => {
  const [travelDate, setTravelDate] = useState(null);
  const [ticketStatus, setTicketStatus] = useState("ALL");

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    isError: bookingsError,
    error: bookingsErrorDetails,
  } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: getOwnBookings,
  });

  // Load tickets for all bookings, including cancelled bookings.
  // Bookings without generated tickets are skipped.
  const {
    data: ticketEntries = [],
    isLoading: ticketsLoading,
    isError: ticketsError,
    error: ticketsErrorDetails,
  } = useQuery({
    queryKey: ["my-tickets", bookings.map((booking) => booking._id)],
    queryFn: async () => {
      const results = await Promise.all(
        bookings.map(async (booking) => {
          try {
            const ticket = await getTicket(booking._id);

            if (!ticket) return null;

            return {
              ticket: ticket.data ?? ticket,
              booking,
            };
          } catch (error) {
            // A booking may not have a generated ticket yet.
            if (error?.response?.status === 404) {
              return null;
            }

            // Preserve genuine API and network errors.
            throw error;
          }
        }),
      );

      return results.filter(Boolean);
    },
    enabled: bookings.length > 0,
  });

  const filteredTickets = ticketEntries.filter(({ ticket, booking }) => {
    const trip = booking.tripId;
    const dateValue = ticket.travelDate || trip?.travelDate;

    const matchesDate =
      !travelDate ||
      (dateValue &&
        dayjs(dateValue).isValid() &&
        dayjs(dateValue).format("YYYY-MM-DD") ===
          travelDate.format("YYYY-MM-DD"));

    // A cancelled ticket must remain cancelled, even if its trip is completed.
    const effectiveStatus =
      ticket.ticketStatus === "CANCELLED"
        ? "CANCELLED"
        : trip?.tripStatus === "COMPLETED"
          ? "COMPLETED"
          : ticket.ticketStatus;

    const matchesStatus =
      ticketStatus === "ALL" || effectiveStatus === ticketStatus;

    return Boolean(matchesDate) && matchesStatus;
  });

  const resetFilters = () => {
    setTravelDate(null);
    setTicketStatus("ALL");
  };

  if (bookingsLoading || (bookings.length > 0 && ticketsLoading)) {
    return <Typography>Loading your tickets...</Typography>;
  }

  if (bookingsError || ticketsError) {
    const errorMessage =
      bookingsErrorDetails?.response?.data?.message ||
      bookingsErrorDetails?.message ||
      ticketsErrorDetails?.response?.data?.message ||
      ticketsErrorDetails?.message ||
      "Failed to load your tickets.";

    return <Alert severity="error">{errorMessage}</Alert>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          My Tickets
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          View, filter and download your digital bus tickets.
        </Typography>

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
              Filter Tickets
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
                    InputLabelProps: {
                      shrink: true,
                    },
                  },
                  actionBar: {
                    actions: ["clear", "today", "accept"],
                  },
                }}
              />

              <FormControl fullWidth>
                <InputLabel id="ticket-status-label">Ticket Status</InputLabel>

                <Select
                  labelId="ticket-status-label"
                  label="Ticket Status"
                  value={ticketStatus}
                  onChange={(event) => setTicketStatus(event.target.value)}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
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
                disabled={!travelDate && ticketStatus === "ALL"}
              >
                Reset Filters
              </Button>

              <Typography variant="body2" color="text.secondary">
                Showing {filteredTickets.length} of {ticketEntries.length}{" "}
                tickets
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {ticketEntries.length === 0 ? (
          <Card>
            <CardContent>
              <Typography fontWeight={600}>
                You don't have any tickets yet.
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Your generated tickets will appear here after booking.
              </Typography>
            </CardContent>
          </Card>
        ) : filteredTickets.length === 0 ? (
          <Alert severity="info">
            No tickets match your selected filters. Change the date or status,
            or reset the filters.
          </Alert>
        ) : (
          filteredTickets.map(({ ticket, booking }) => {
            const trip = booking.tripId;
            const isCancelled = ticket.ticketStatus === "CANCELLED";

            const effectiveStatus = isCancelled
              ? "CANCELLED"
              : trip?.tripStatus === "COMPLETED"
                ? "COMPLETED"
                : ticket.ticketStatus;

            return (
              <Card
                key={ticket._id || ticket.ticketNumber || booking._id}
                sx={{ mb: 3, borderRadius: 3 }}
              >
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
                      {ticket.sourceCity ||
                        trip?.routeId?.sourceCity ||
                        "Source"}
                      {" → "}
                      {ticket.destinationCity ||
                        trip?.routeId?.destinationCity ||
                        "Destination"}
                    </Typography>

                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={isCancelled ? "error.main" : "text.secondary"}
                    >
                      {effectiveStatus || "UNKNOWN"}
                    </Typography>
                  </Box>

                  <Typography sx={{ mt: 2 }}>
                    <strong>Ticket Number:</strong> {ticket.ticketNumber || "—"}
                  </Typography>

                  <Typography>
                    <strong>Customer:</strong> {ticket.customerName || "—"}
                  </Typography>

                  <Typography>
                    <strong>Bus:</strong> {ticket.busName || "—"}
                  </Typography>

                  <Typography>
                    <strong>Bus Number:</strong> {ticket.busNumber || "—"}
                  </Typography>

                  <Typography>
                    <strong>Seat(s):</strong>{" "}
                    {ticket.seatNumbers?.join(", ") ||
                      booking.seatNumbers?.join(", ") ||
                      "—"}
                  </Typography>

                  <Typography>
                    <strong>Travel Date:</strong>{" "}
                    {formatDate(ticket.travelDate || trip?.travelDate)}
                  </Typography>

                  <Typography>
                    <strong>Departure:</strong>{" "}
                    {formatTime(ticket.departureTime || trip?.departureTime)}
                  </Typography>

                  <Typography>
                    <strong>Amount:</strong> ₹
                    {ticket.amount ?? booking.totalAmount ?? 0}
                  </Typography>

                  {!isCancelled && (
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      sx={{ mt: 3 }}
                      onClick={() => downloadTicketPdf(ticket)}
                    >
                      Download PDF
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default MyTickets;
