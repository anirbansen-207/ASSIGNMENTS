
import { useLocation, useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  Download,
  Print,
  DirectionsBus,
  ConfirmationNumber,
  Route,
  EventSeat,
  CalendarMonth,
  AccessTime,
  Payments,
  ArrowForward,
} from "@mui/icons-material";

import PersonIcon from "@mui/icons-material/Person";

import { downloadTicketPdf } from "../../utils/ticketPdf";

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const DetailItem = ({ icon, label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start">
    <Box
      sx={{
        width: 42,
        height: 42,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 2,
        bgcolor: "#edf5ff",
        color: "#1769aa",
      }}
    >
      {icon}
    </Box>

    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography
        fontWeight={600}
        sx={{
          mt: 0.35,
          overflowWrap: "anywhere",
          color: "#17243b",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  </Stack>
);

const PrintTicket = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Ticket is passed from the Booking Staff Bookings page.
  const ticket = location.state?.ticket;

  if (!ticket) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h5" fontWeight={700} color="#10213d">
          Ticket information not found
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          Please return to bookings and open the ticket again.
        </Typography>

        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/booking-staff/bookings")}
        >
          Back to Bookings
        </Button>
      </Box>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadTicketPdf(ticket);
  };

  const isCancelled = ticket.ticketStatus === "CANCELLED";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f6fb",
        px: { xs: 1.5, sm: 3, md: 4 },
        py: { xs: 2.5, md: 4 },
        "@media print": {
          minHeight: "auto",
          bgcolor: "#fff",
          p: 0,
        },
      }}
    >
      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        <Box
          className="ticket-page-heading"
          sx={{ mb: 3, "@media print": { display: "none" } }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#10213d",
              fontSize: { xs: "1.7rem", sm: "2.1rem" },
            }}
          >
            Booking Confirmation
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.7 }}>
            Your journey details and digital ticket.
          </Typography>
        </Box>

        <Card
          className="greenbus-ticket-card"
          elevation={0}
          sx={{
            overflow: "hidden",
            borderRadius: { xs: 3, md: 4 },
            border: "1px solid #e1e7f0",
            boxShadow: "0 12px 35px rgba(15, 35, 70, 0.08)",
            "@media print": {
              border: "1px solid #dce3ed",
              borderRadius: "12px",
              boxShadow: "none",
              overflow: "visible",
            },
          }}
        >
          {/* GreenBus branding matching the customer ticket */}
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              bgcolor: "#071631",
              color: "#fff",
              px: { xs: 2.5, sm: 4, md: 5 },
              py: { xs: 3, md: 4 },
              "&::after": {
                content: '""',
                position: "absolute",
                width: 190,
                height: 190,
                right: -45,
                top: -80,
                borderRadius: "50%",
                bgcolor: "rgba(34, 197, 94, 0.09)",
                pointerEvents: "none",
              },
              "@media print": {
                printColorAdjust: "exact",
                WebkitPrintColorAdjust: "exact",
              },
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={2}
              sx={{ position: "relative", zIndex: 1 }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ minWidth: 0 }}
              >
                <Box
                  sx={{
                    width: { xs: 58, sm: 76 },
                    height: { xs: 58, sm: 76 },
                    flexShrink: 0,
                    borderRadius: 3,
                    bgcolor: "#22c55e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#071631",
                  }}
                >
                  <DirectionsBus sx={{ fontSize: { xs: 36, sm: 48 } }} />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    component="div"
                    sx={{
                      fontSize: { xs: "1.7rem", sm: "2.2rem" },
                      lineHeight: 1.15,
                      fontWeight: 500,
                      letterSpacing: "-0.7px",
                    }}
                  >
                    <Box component="span" sx={{ color: "#22c55e" }}>
                      Green
                    </Box>
                    <Box component="span" sx={{ color: "#fff" }}>
                      Bus
                    </Box>
                  </Typography>

                  <Typography
                    sx={{
                      color: "#fbbf24",
                      fontSize: { xs: "0.72rem", sm: "0.9rem" },
                      fontWeight: 700,
                      mt: 0.7,
                      letterSpacing: 0.2,
                    }}
                  >
                    Bus management Service
                  </Typography>
                </Box>
              </Stack>

              <Chip
                label={isCancelled ? "CANCELLED" : "ACTIVE"}
                sx={{
                  flexShrink: 0,
                  fontWeight: 800,
                  color: isCancelled ? "#fecaca" : "#bbf7d0",
                  bgcolor: isCancelled
                    ? "rgba(239,68,68,0.15)"
                    : "rgba(34,197,94,0.16)",
                  border: `1px solid ${
                    isCancelled ? "#ef4444" : "#22c55e"
                  }`,
                  "& .MuiChip-label": {
                    px: { xs: 1, sm: 1.5 },
                  },
                  "@media print": {
                    printColorAdjust: "exact",
                    WebkitPrintColorAdjust: "exact",
                  },
                }}
              />
            </Stack>

            <Typography
              sx={{
                mt: 3,
                fontSize: { xs: "1rem", sm: "1.2rem" },
                color: "#e5edf9",
                position: "relative",
                zIndex: 1,
              }}
            >
              {isCancelled
                ? "This ticket has been cancelled."
                : "Your ticket is confirmed"}
            </Typography>
          </Box>

          <CardContent
            sx={{
              p: { xs: 2.5, sm: 4, md: 5 },
              "&:last-child": { pb: { xs: 2.5, sm: 4, md: 5 } },
            }}
          >
            {/* Ticket and passenger information */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  icon={<ConfirmationNumber />}
                  label="Ticket Number"
                  value={ticket.ticketNumber}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DetailItem
                  icon={<PersonIcon  />}
                  label="Passenger"
                  value={ticket.customerName}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3.5, borderColor: "#e6ebf2" }} />

            {/* Journey route */}
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: "#f7faff",
                border: "1px solid #e4ebf5",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                <Route sx={{ color: "#1769aa" }} />
                <Typography variant="h6" fontWeight={700} color="#10213d">
                  Journey Details
                </Typography>
              </Stack>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={5}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    FROM
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.1rem", sm: "1.4rem" },
                      overflowWrap: "anywhere",
                      color: "#10213d",
                    }}
                  >
                    {ticket.sourceCity || "-"}
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={2}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      bgcolor: "#e3f4e9",
                      color: "#15803d",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ArrowForward />
                  </Box>
                </Grid>

                <Grid item xs={5}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    TO
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.1rem", sm: "1.4rem" },
                      overflowWrap: "anywhere",
                      color: "#10213d",
                    }}
                  >
                    {ticket.destinationCity || "-"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  icon={<DirectionsBus />}
                  label="Bus Name"
                  value={ticket.busName || "GreenBus"}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DetailItem
                  icon={<DirectionsBus />}
                  label="Bus Number"
                  value={ticket.busNumber}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DetailItem
                  icon={<EventSeat />}
                  label="Seat(s)"
                  value={ticket.seatNumbers?.join(", ")}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DetailItem
                  icon={<CalendarMonth />}
                  label="Travel Date"
                  value={formatDate(ticket.travelDate)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DetailItem
                  icon={<AccessTime />}
                  label="Departure"
                  value={formatDateTime(ticket.departureTime)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DetailItem
                  icon={<AccessTime />}
                  label="Arrival"
                  value={formatDateTime(ticket.arrivalTime)}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3.5, borderColor: "#e6ebf2" }} />

            {/* Amount and status */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid #e1e7f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                    bgcolor: "#e3f4e9",
                    color: "#15803d",
                  }}
                >
                  <Payments />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="#10213d">
                    ₹{Number(ticket.amount ?? 0).toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                <Typography variant="body2" color="text.secondary">
                  Ticket Status
                </Typography>

                <Chip
                  size="small"
                  label={ticket.ticketStatus || "ACTIVE"}
                  color={isCancelled ? "error" : "success"}
                  sx={{ mt: 0.6, fontWeight: 700 }}
                />
              </Box>
            </Box>

            <Typography
              align="center"
              color="text.secondary"
              variant="body2"
              sx={{ mt: 3 }}
            >
              Thank you for choosing GreenBus.
            </Typography>

            {/* Keep actions out of the printed ticket */}
            <Box
              className="ticket-actions"
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1.5,
                flexWrap: "wrap",
                mt: 3.5,
                "@media print": {
                  display: "none",
                },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/booking-staff/bookings")}
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  py: 1.1,
                  fontWeight: 700,
                }}
              >
                Back
              </Button>

              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={handlePrint}
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  py: 1.1,
                  fontWeight: 700,
                }}
              >
                Print Ticket
              </Button>

              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleDownload}
                sx={{
                  borderRadius: 2,
                  px: 2.5,
                  py: 1.1,
                  fontWeight: 700,
                  bgcolor: "#1769aa",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#12558b",
                    boxShadow: "none",
                  },
                }}
              >
                Download PDF
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PrintTicket;
