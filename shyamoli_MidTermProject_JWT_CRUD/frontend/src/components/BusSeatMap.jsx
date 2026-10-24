
import { Box, Card, Typography } from "@mui/material";

const BusSeatMap = ({
  seats = [],
  busType,
  selectedSeats = [],
  onSeatClick,
  admin = false,
  onSeatTypeChange,
}) => {
  const isSleeper = busType === "SLEEPER";

  const seatStyle = (seat) => {
    const selected = selectedSeats.includes(seat.seatNumber);

    return {
      border: selected ? "2px solid #15803d" : "1px solid #cbd5e1",
      borderRadius: 1.5,
      backgroundColor: seat.isBooked
        ? "#e5e7eb"
        : selected
          ? "#bbf7d0"
          : "#fff",
      color: "#1e293b",
      minWidth: 0,
      p: 1,
      textAlign: "center",
      cursor: admin ? "default" : seat.isBooked ? "not-allowed" : "pointer",
      opacity: seat.isBooked ? 0.7 : 1,
    };
  };

  const renderSeat = (seat) => (
    <Card
      key={seat.seatNumber}
      onClick={() => !admin && !seat.isBooked && onSeatClick?.(seat)}
      sx={seatStyle(seat)}
      elevation={0}
    >
      <Typography variant="body2" fontWeight={700}>
        {seat.seatNumber}
      </Typography>

      {isSleeper && (
        <Typography variant="caption" display="block">
          {seat.berthLevel === "upper" ? "Upper" : "Lower"}
        </Typography>
      )}

      {!admin && (
        <Typography variant="caption" display="block">
          {seat.isBooked
            ? "Booked"
            : selectedSeats.includes(seat.seatNumber)
              ? "Selected"
              : "Available"}
        </Typography>
      )}

      {admin && (
        <Box
          component="select"
          value={seat.seatType || "regular"}
          onChange={(event) =>
            onSeatTypeChange?.(seat.seatNumber, event.target.value)
          }
          onClick={(event) => event.stopPropagation()}
          sx={{
            width: "100%",
            mt: 1,
            p: 0.5,
            border: "1px solid #cbd5e1",
            borderRadius: 1,
            backgroundColor: "white",
            fontSize: 12,
          }}
        >
          <option value="regular">Regular</option>
          <option value="vip">VIP</option>
          <option value="ladies">Ladies</option>
          <option value="reserved">Reserved</option>
        </Box>
      )}
    </Card>
  );

  if (isSleeper) {
    const berthRows = [];

    for (let i = 0; i < seats.length; i += 2) {
      berthRows.push(seats.slice(i, i + 2));
    }

    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 430,
          p: 2,
          border: "2px solid #94a3b8",
          borderRadius: "28px 28px 16px 16px",
          backgroundColor: "#f1f5f9",
        }}
      >
        <Typography textAlign="center" mb={2} fontWeight={700}>
          ★ FRONT — SLEEPER BUS
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {berthRows.map((row, index) => (
            <Box
              key={row[0]?.seatNumber || index}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1,
              }}
            >
              {row.map(renderSeat)}
            </Box>
          ))}
        </Box>

        <Typography textAlign="center" mt={2} variant="caption">
          REAR OF BUS
        </Typography>
      </Box>
    );
  }

  const rearSeats = seats.slice(-4);
  const frontSeats = seats.slice(0, Math.max(0, seats.length - 4));
  const rows = [];

  for (let i = 0; i < frontSeats.length; i += 4) {
    rows.push(frontSeats.slice(i, i + 4));
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 430,
        p: 2,
        border: "2px solid #94a3b8",
        borderRadius: "28px 28px 16px 16px",
        backgroundColor: "#f1f5f9",
      }}
    >
      <Typography textAlign="center" mb={2} fontWeight={700}>
        ★ FRONT — SEATER BUS
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {rows.map((row, rowIndex) => (
          <Box
            key={row[0]?.seatNumber || rowIndex}
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 18px 1fr 1fr",
              gap: 0.75,
              alignItems: "center",
            }}
          >
            {row.map((seat, index) => (
              <Box
                key={seat.seatNumber}
                sx={{ gridColumn: index < 2 ? index + 1 : index + 2 }}
              >
                {renderSeat(seat)}
              </Box>
            ))}

            <Box
              sx={{
                gridColumn: 3,
                gridRow: 1,
                minHeight: 50,
                justifySelf: "center",
                borderLeft: "1px dashed #94a3b8",
              }}
            />
          </Box>
        ))}
      </Box>

      {rearSeats.length > 0 && (
        <Box sx={{ mt: 2, pt: 2, borderTop: "2px solid #cbd5e1" }}>
          <Typography
            variant="caption"
            display="block"
            textAlign="center"
            mb={1}
          >
            REAR ROW
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 0.75,
            }}
          >
            {rearSeats.map(renderSeat)}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BusSeatMap;
