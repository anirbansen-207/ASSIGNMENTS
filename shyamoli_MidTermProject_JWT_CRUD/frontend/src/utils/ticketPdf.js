
import jsPDF from "jspdf";

export const downloadTicketPdf = (ticket) => {
  const doc = new jsPDF();

  // Use the available amount field from the ticket data.
  const amount =
    ticket.amount ??
    ticket.totalAmount ??
    ticket.ticketPrice ??
    0;

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

  const formatTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
  };

  // GreenBus branding
  doc.setFillColor(7, 22, 49);
  doc.rect(0, 0, 210, 48, "F");

  doc.setFillColor(34, 197, 94);
  doc.roundedRect(17, 12, 19, 19, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(7, 22, 49);
  doc.text("BUS", 26.5, 24, { align: "center" });

  doc.setFontSize(23);
  doc.setTextColor(34, 197, 94);
  doc.text("Green", 43, 21);

  const greenWidth = doc.getTextWidth("Green");
  doc.setTextColor(255, 255, 255);
  doc.text("Bus", 43 + greenWidth, 21);

  doc.setFontSize(9);
  doc.setTextColor(251, 191, 36);
  doc.text("Bus management Service", 43, 29);

  doc.setFontSize(10);
  doc.setTextColor(229, 237, 249);
  doc.text("Your journey. Your comfort.", 17, 41);

  // Ticket heading
  doc.setTextColor(16, 33, 61);
  doc.setFontSize(19);
  doc.setFont("helvetica", "bold");
  doc.text("TRAVEL TICKET", 17, 62);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Booking confirmation and journey details", 17, 69);

  // Ticket number
  doc.setFillColor(242, 247, 253);
  doc.roundedRect(17, 76, 176, 22, 3, 3, "F");

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("TICKET NUMBER", 22, 84);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 33, 61);
  doc.text(String(ticket.ticketNumber || "-"), 22, 91);

  // Helper for section headings and detail rows
  const sectionHeading = (text, y) => {
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(17, y - 4, 2, 7, 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(16, 33, 61);
    doc.text(text, 23, y);
  };

  const detail = (label, value, x, y, width = 80) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), x, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(16, 33, 61);

    const lines = doc.splitTextToSize(String(value ?? "-"), width);
    doc.text(lines, x, y + 6);
  };

  // Passenger information
  sectionHeading("Passenger Information", 110);

  detail("Passenger Name", ticket.customerName || "-", 17, 120);
  detail(
    "Seat Number(s)",
    ticket.seatNumbers?.join(", ") || "-",
    105,
    120
  );

  // Journey information
  sectionHeading("Journey Details", 146);

  doc.setFillColor(242, 247, 253);
  doc.roundedRect(17, 152, 176, 27, 3, 3, "F");

  detail("From", ticket.sourceCity || "-", 22, 161, 55);
  detail("To", ticket.destinationCity || "-", 145, 161, 42);

  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(1.2);
  doc.line(76, 166, 139, 166);

  doc.setFillColor(34, 197, 94);
  doc.circle(107.5, 166, 1.5, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Travel date: ${formatDate(ticket.travelDate)}`, 22, 175);

  detail("Departure", formatTime(ticket.departureTime), 17, 190, 75);
  detail("Arrival", formatTime(ticket.arrivalTime), 105, 190, 75);

  // Bus information
  sectionHeading("Bus Information", 213);

  doc.setDrawColor(220, 228, 239);
  doc.roundedRect(17, 219, 176, 22, 3, 3, "S");

  detail("Bus Name", ticket.busName || "GreenBus", 22, 228, 70);
  detail("Bus Number", ticket.busNumber || "-", 105, 228, 75);

  // Payment summary — use the resolved amount above.
  doc.setFillColor(7, 22, 49);
  doc.roundedRect(17, 249, 176, 25, 3, 3, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(229, 237, 249);
  doc.text("TOTAL AMOUNT", 23, 258);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(34, 197, 94);
  doc.text(
    `Rs. ${Number(amount).toLocaleString("en-IN")}`,
    23,
    268
  );

  // Ticket status
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(
    ticket.ticketStatus === "CANCELLED" ? 220 : 22,
    ticket.ticketStatus === "CANCELLED" ? 38 : 101,
    ticket.ticketStatus === "CANCELLED" ? 38 : 52
  );

  doc.text(
    `STATUS: ${ticket.ticketStatus || "ACTIVE"}`,
    190,
    284,
    { align: "right" }
  );

  // Footer
  doc.setDrawColor(220, 228, 239);
  doc.line(17, 289, 193, 289);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Please carry this ticket during your journey.",
    105,
    296,
    { align: "center" }
  );

  doc.save(
    `GreenBus-Ticket-${ticket.ticketNumber || "ticket"}.pdf`
  );
};
