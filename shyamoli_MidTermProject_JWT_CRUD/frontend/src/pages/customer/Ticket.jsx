
import { useQuery } from "@tanstack/react-query";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";

import DirectionsBusFilledIcon from "@mui/icons-material/DirectionsBusFilled";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import PersonIcon from "@mui/icons-material/Person";
import DownloadIcon from "@mui/icons-material/Download";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { getTicket } from "../../services/customerService";
import jsPDF from "jspdf";

const Ticket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Ticket received during normal navigation.
  const stateTicket = location.state?.ticket;

  // Booking ID allows the ticket to be recovered after a page refresh.
  const bookingId = searchParams.get("bookingId");

  const {
    data: fetchedTicket,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["customer-ticket", bookingId],
    queryFn: () => getTicket(bookingId),
    enabled: Boolean(bookingId) && !stateTicket,
    retry: 1,
  });

  const ticket = stateTicket || fetchedTicket;

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  // Loading state.
  if (!ticket && isLoading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">
          Loading your ticket...
        </Typography>
      </Box>
    );
  }

  // Error state.
  if (!ticket && isError) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h5" color="error">
          Failed to load ticket.
        </Typography>

        <Typography sx={{ mt: 1 }} color="text.secondary">
          {error?.response?.data?.message ||
            "Unable to load ticket details."}
        </Typography>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/customer")}
        >
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  // No ticket found.
  if (!ticket) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h5">Ticket not found.</Typography>

        <Typography sx={{ mt: 1 }} color="text.secondary">
          We could not find a ticket for this booking.
        </Typography>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/customer")}
        >
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  // Download the existing ticket as a PDF.
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // GreenBus branding.
    doc.setFillColor(7, 22, 49);
    doc.rect(0, 0, pageWidth, 43, "F");

    doc.setFillColor(29, 190, 99);
    doc.roundedRect(15, 10, 20, 20, 3, 3, "F");

    doc.setFillColor(7, 22, 49);
    doc.roundedRect(20, 14, 10, 12, 1.5, 1.5, "F");
    doc.circle(22, 28, 1.2, "F");
    doc.circle(28, 28, 1.2, "F");

    doc.setTextColor(29, 190, 99);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(23);
    doc.text("Green", 40, 21);

    const greenWidth = doc.getTextWidth("Green");
    doc.setTextColor(255, 255, 255);
    doc.text("Bus", 40 + greenWidth, 21);

    doc.setTextColor(255, 193, 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Bus management Service", 40, 29);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("TICKET CONFIRMATION", 15, 38);

    let y = 55;

    const addLine = (label, value) => {
      // Keep long values inside the PDF page.
      const labelX = 15;
      const valueX = 57;
      const maxWidth = pageWidth - valueX - 15;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(35, 48, 65);
      doc.text(label, labelX, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(65, 75, 90);

      const lines = doc.splitTextToSize(
        String(value ?? "-"),
        maxWidth,
      );

      doc.text(lines, valueX, y);
      y += Math.max(8, lines.length * 6);
    };

    const addSection = (title) => {
      y += 3;

      if (y > 265) {
        doc.addPage();
        y = 20;
      }

      doc.setDrawColor(220, 226, 235);
      doc.line(15, y, pageWidth - 15, y);

      y += 9;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(7, 22, 49);
      doc.text(title, 15, y);

      y += 9;
      doc.setFontSize(10);
    };

    doc.setFontSize(10);

    addSection("Ticket Information");
    addLine("Ticket Number:", ticket.ticketNumber);
    addLine("Customer:", ticket.customerName);
    addLine("Status:", ticket.ticketStatus);

    addSection("Journey Details");
    addLine("From:", ticket.sourceCity);
    addLine("To:", ticket.destinationCity);
    addLine("Bus Name:", ticket.busName);
    addLine("Bus Number:", ticket.busNumber);
    addLine("Seat(s):", ticket.seatNumbers?.join(", ") || "-");

    addSection("Travel Details");
    addLine("Travel Date:", formatDate(ticket.travelDate));
    addLine("Departure:", formatDateTime(ticket.departureTime));
    addLine("Arrival:", formatDateTime(ticket.arrivalTime));

    addSection("Payment Details");
    addLine("Amount:", `Rs. ${ticket.amount ?? 0}`);

    y += 10;

    if (y > 275) {
      doc.addPage();
      y = 20;
    }

    doc.setDrawColor(220, 226, 235);
    doc.line(15, y, pageWidth - 15, y);

    y += 9;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 110, 125);
    doc.text(
      "Thank you for choosing GreenBus.",
      15,
      y,
    );

    doc.save(
      `GreenBus-Ticket-${ticket.ticketNumber || "booking"}.pdf`,
    );
  };

  const isCancelled = ticket.ticketStatus === "CANCELLED";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f3f6fb",
        py: { xs: 2, md: 4 },
        px: { xs: 1.5, sm: 3, md: 5 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Typography
          variant="h4"
          sx={{
            mb: 0.75,
            fontWeight: 750,
            color: "#071631",
            fontSize: { xs: "1.7rem", md: "2.1rem" },
          }}
        >
          Booking Confirmation
        </Typography>

        <Typography
          sx={{
            mb: 3,
            color: "#65738a",
            fontSize: { xs: "0.95rem", md: "1.05rem" },
          }}
        >
          Your journey details and digital ticket.
        </Typography>

        <Card
          elevation={0}
          sx={{
            overflow: "hidden",
            borderRadius: 4,
            border: "1px solid #e1e7f0",
            boxShadow: "0 14px 40px rgba(7, 22, 49, 0.08)",
          }}
        >
          {/* GreenBus ticket header */}
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 3,
              px: { xs: 2.5, md: 4 },
              py: { xs: 3, md: 3.5 },
              color: "#fff",
              backgroundColor: "#071631",
              "&::after": {
                content: '""',
                position: "absolute",
                width: 180,
                height: 180,
                borderRadius: "50%",
                backgroundColor: "rgba(29, 190, 99, 0.09)",
                top: -85,
                right: -35,
                pointerEvents: "none",
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2.5,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    flexShrink: 0,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1dbe63",
                  }}
                >
                  <DirectionsBusFilledIcon
                    sx={{ fontSize: 47, color: "#071631" }}
                  />
                </Box>

                <Box>
                  <Typography
                    component="div"
                    sx={{
                      fontSize: { xs: "1.8rem", md: "2.25rem" },
                      fontWeight: 500,
                      letterSpacing: "-0.8px",
                      lineHeight: 1.2,
                    }}
                  >
                    <Box component="span" sx={{ color: "#1dbe63" }}>
                      Green
                    </Box>
                    <Box component="span" sx={{ color: "#ffffff" }}>
                      Bus
                    </Box>
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: "#ffc107",
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      fontWeight: 600,
                      letterSpacing: 0.25,
                    }}
                  >
                    Bus management Service
                  </Typography>
                </Box>
              </Box>

              <Typography
                sx={{
                  fontSize: { xs: "1rem", md: "1.15rem" },
                  color: "#e6edf8",
                }}
              >
                {isCancelled
                  ? "This ticket has been cancelled."
                  : "Your ticket is confirmed"}
              </Typography>
            </Box>

            <Chip
              label={ticket.ticketStatus || "UNKNOWN"}
              sx={{
                position: "relative",
                zIndex: 1,
                alignSelf: { xs: "flex-start", sm: "flex-start" },
                fontWeight: 800,
                fontSize: "0.95rem",
                color: isCancelled ? "#ffc1c1" : "#9df5bc",
                backgroundColor: isCancelled
                  ? "rgba(211, 47, 47, 0.16)"
                  : "rgba(29, 190, 99, 0.16)",
                border: `1px solid ${
                  isCancelled ? "#e57373" : "#1dbe63"
                }`,
              }}
            />
          </Box>

          <CardContent
            sx={{
              p: { xs: 2.5, md: 4 },
              "&:last-child": { pb: { xs: 2.5, md: 4 } },
            }}
          >
            {/* Ticket and passenger information */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2.5,
              }}
            >
              <Box sx={{ display: "flex", gap: 1.75, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    borderRadius: 2,
                    backgroundColor: "#eaf3ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ConfirmationNumberOutlinedIcon
                    sx={{ color: "#1769aa", fontSize: 28 }}
                  />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary">
                    Ticket Number
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                      overflowWrap: "anywhere",
                      color: "#071631",
                    }}
                  >
                    {ticket.ticketNumber || "-"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 1.75, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    borderRadius: 2,
                    backgroundColor: "#eaf3ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PersonIcon sx={{ color: "#1769aa", fontSize: 28 }} />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary">
                    Passenger
                  </Typography>
                  <Typography sx={{ mt: 0.5, fontWeight: 700 }}>
                    {ticket.customerName || "-"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Journey information */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <LocationOnOutlinedIcon sx={{ color: "#1dbe63" }} />
              <Typography variant="h6" fontWeight={700} color="#071631">
                Journey Details
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#f7f9fc",
                  border: "1px solid #e8edf4",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  From
                </Typography>
                <Typography sx={{ mt: 0.5, fontWeight: 700 }}>
                  {ticket.sourceCity || "-"}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#f7f9fc",
                  border: "1px solid #e8edf4",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  To
                </Typography>
                <Typography sx={{ mt: 0.5, fontWeight: 700 }}>
                  {ticket.destinationCity || "-"}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
                mt: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Bus Name
                </Typography>
                <Typography sx={{ mt: 0.5, fontWeight: 600 }}>
                  {ticket.busName || "-"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Bus Number
                </Typography>
                <Typography sx={{ mt: 0.5, fontWeight: 600 }}>
                  {ticket.busNumber || "-"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <AirlineSeatReclineNormalIcon sx={{ color: "#1769aa" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Seat(s)
                  </Typography>
                  <Typography sx={{ mt: 0.5, fontWeight: 700 }}>
                    {ticket.seatNumbers?.join(", ") || "-"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Travel information */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <EventOutlinedIcon sx={{ color: "#1dbe63" }} />
              <Typography variant="h6" fontWeight={700} color="#071631">
                Travel Details
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2.5,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Travel Date
                </Typography>
                <Typography sx={{ mt: 0.5, fontWeight: 600 }}>
                  {formatDate(ticket.travelDate)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Departure
                </Typography>
                <Typography sx={{ mt: 0.5, fontWeight: 600 }}>
                  {formatDateTime(ticket.departureTime)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Arrival
                </Typography>
                <Typography sx={{ mt: 0.5, fontWeight: 600 }}>
                  {formatDateTime(ticket.arrivalTime)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Payment information */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
                p: 2.5,
                borderRadius: 3,
                backgroundColor: "#f2fbf6",
                border: "1px solid #d9f2e3",
              }}
            >
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <PaymentsOutlinedIcon
                  sx={{ color: "#168447", fontSize: 30 }}
                />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ mt: 0.25, fontWeight: 800, color: "#116b39" }}
                  >
                    ₹{Number(ticket.amount || 0).toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={isCancelled ? "Cancelled Ticket" : "Booking Details Saved"}
                color={isCancelled ? "error" : "success"}
                variant="outlined"
              />
            </Box>

            {/* Existing navigation and PDF download actions */}
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                mt: 3.5,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                onClick={() => navigate("/customer")}
                sx={{
                  px: 2.5,
                  py: 1.1,
                  fontWeight: 700,
                  backgroundColor: "#1769aa",
                  "&:hover": { backgroundColor: "#0d4f86" },
                }}
              >
                Go to Dashboard
              </Button>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadPDF}
                sx={{
                  px: 2.5,
                  py: 1.1,
                  fontWeight: 700,
                  borderColor: "#1769aa",
                  color: "#1769aa",
                  "&:hover": {
                    borderColor: "#0d4f86",
                    backgroundColor: "#f0f6fc",
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

export default Ticket;
