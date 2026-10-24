
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  Stack,
} from "@mui/material";

import { getAllTrips } from "../../services/tripService";

const CustomerTrips = () => {
  const navigate = useNavigate();

  const {
    data: trips = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["trips"],
    queryFn: getAllTrips,
  });

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

  const formatTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    switch ((status || "SCHEDULED").toUpperCase()) {
      case "SCHEDULED":
        return {
          color: "#15803D",
          backgroundColor: "#DCFCE7",
        };
      case "ONGOING":
        return {
          color: "#1D4ED8",
          backgroundColor: "#DBEAFE",
        };
      case "COMPLETED":
        return {
          color: "#475569",
          backgroundColor: "#E2E8F0",
        };
      case "CANCELLED":
        return {
          color: "#B91C1C",
          backgroundColor: "#FEE2E2",
        };
      default:
        return {
          color: "#475569",
          backgroundColor: "#F1F5F9",
        };
    }
  };

  const DetailItem = ({ label, value, symbol }) => (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 38,
          height: 38,
          flexShrink: 0,
          borderRadius: 2,
          bgcolor: "#EFF6FF",
          color: "#176B45",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        {symbol}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "#64748B",
            lineHeight: 1.4,
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#0F172A",
            fontWeight: 600,
            overflowWrap: "anywhere",
          }}
        >
          {value || "-"}
        </Typography>
      </Box>
    </Stack>
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "45vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: "#16A34A" }} />

        <Typography color="text.secondary">
          Finding available trips for you...
        </Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          bgcolor: "#FEF2F2",
          border: "1px solid #FECACA",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#B91C1C", fontWeight: 700 }}
        >
          Unable to load trips
        </Typography>

        <Typography sx={{ mt: 1, color: "#7F1D1D" }}>
          {error?.message || "Something went wrong while loading trips."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1440,
        mx: "auto",
        pb: 5,
      }}
    >
      {/* Page heading */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          background:
            "linear-gradient(120deg, #071832 0%, #102B4C 72%, #14532D 100%)",
          color: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 190,
            height: 190,
            borderRadius: "50%",
            right: -65,
            top: -95,
            bgcolor: "rgba(34,197,94,0.12)",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            label="GREENBUS • TRAVEL"
            size="small"
            sx={{
              mb: 2,
              color: "#BBF7D0",
              bgcolor: "rgba(22,163,74,0.2)",
              border: "1px solid rgba(134,239,172,0.35)",
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          />

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.8rem", sm: "2.25rem" },
              lineHeight: 1.2,
              mb: 1.5,
            }}
          >
            Book Your Ticket
          </Typography>

          <Typography
            sx={{
              color: "#D6E2F0",
              maxWidth: 600,
              lineHeight: 1.7,
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            Find your next journey, explore available trips, and choose
            your seats with GreenBus.
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 2.5 }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#4ADE80",
              }}
            />

            <Typography
              variant="body2"
              sx={{ color: "#BBF7D0", fontWeight: 600 }}
            >
              {trips.length} {trips.length === 1 ? "trip" : "trips"} found
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Trips list */}
      {trips.length === 0 ? (
        <Box
          sx={{
            py: { xs: 6, sm: 9 },
            px: 3,
            textAlign: "center",
            bgcolor: "#FFFFFF",
            border: "1px dashed #CBD5E1",
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              mx: "auto",
              mb: 2,
              width: 68,
              height: 68,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              bgcolor: "#F0FDF4",
              color: "#15803D",
              fontSize: 32,
            }}
          >
            ↗
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            No trips available right now
          </Typography>

          <Typography color="text.secondary">
            Please check again later for available journeys.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {trips.map((trip) => {
            const status = (trip.tripStatus || "SCHEDULED").toUpperCase();
            const statusStyle = getStatusColor(status);
            const canBook = status === "SCHEDULED";

            return (
              <Grid item xs={12} md={6} xl={4} key={trip._id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    transition:
                      "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 14px 35px rgba(15, 23, 42, 0.09)",
                      borderColor: "#86EFAC",
                    },
                  }}
                >
                  {/* Bus header */}
                  <Box
                    sx={{
                      px: 2.5,
                      py: 2.25,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      bgcolor: "#F8FAFC",
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ minWidth: 0 }}
                    >
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          flexShrink: 0,
                          borderRadius: 2,
                          bgcolor: "#DCFCE7",
                          color: "#166534",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 24,
                        }}
                      >
                        ▣
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: "1.05rem",
                            fontWeight: 800,
                            color: "#0F172A",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {trip.busId?.busName || "Bus"}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{ color: "#64748B", mt: 0.25 }}
                        >
                          Bus No. {trip.busId?.busNumber || "-"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      label={status}
                      size="small"
                      sx={{
                        flexShrink: 0,
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        letterSpacing: 0.2,
                        color: statusStyle.color,
                        bgcolor: statusStyle.backgroundColor,
                      }}
                    />
                  </Box>

                  <CardContent
                    sx={{
                      p: 2.5,
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                      "&:last-child": { pb: 2.5 },
                    }}
                  >
                    {/* Route */}
                    <Box
                      sx={{
                        p: 2,
                        mb: 2.5,
                        borderRadius: 2.5,
                        bgcolor: "#F8FAFC",
                        border: "1px solid #F1F5F9",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748B",
                              fontWeight: 700,
                              letterSpacing: 0.8,
                            }}
                          >
                            FROM
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.5,
                              fontWeight: 800,
                              fontSize: { xs: "1rem", sm: "1.1rem" },
                              color: "#0F172A",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {trip.routeId?.sourceCity || "-"}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            width: 42,
                            height: 32,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#16A34A",
                            fontSize: 23,
                            fontWeight: 700,
                          }}
                        >
                          →
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0, textAlign: "right" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748B",
                              fontWeight: 700,
                              letterSpacing: 0.8,
                            }}
                          >
                            TO
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.5,
                              fontWeight: 800,
                              fontSize: { xs: "1rem", sm: "1.1rem" },
                              color: "#0F172A",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {trip.routeId?.destinationCity || "-"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    {/* Travel details */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 2,
                        color: "#334155",
                        fontWeight: 800,
                      }}
                    >
                      Journey details
                    </Typography>

                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <DetailItem
                          symbol="▦"
                          label="Travel date"
                          value={formatDate(trip.travelDate)}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <DetailItem
                          symbol="◷"
                          label="Departure"
                          value={formatTime(trip.departureTime)}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <DetailItem
                          symbol="◉"
                          label="Bus number"
                          value={trip.busId?.busNumber || "-"}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <DetailItem
                          symbol="◷"
                          label="Arrival"
                          value={formatTime(trip.arrivalTime)}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ flexGrow: 1, minHeight: 22 }} />

                    <Divider sx={{ my: 2.5, borderColor: "#E2E8F0" }} />

                    {/* Booking action */}
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={!canBook}
                      endIcon={<Box component="span" sx={{ fontSize: 20 }}>→</Box>}
                      onClick={() =>
                        navigate(`/customer/trips/${trip._id}`)
                      }
                      sx={{
                        py: 1.35,
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        letterSpacing: 0.2,
                        bgcolor: "#176B45",
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: "#14532D",
                          boxShadow: "0 5px 14px rgba(22, 101, 52, 0.2)",
                        },
                        "&.Mui-disabled": {
                          bgcolor: "#E2E8F0",
                          color: "#94A3B8",
                        },
                      }}
                    >
                      {canBook ? "View & Book Seats" : `Trip ${status.toLowerCase()}`}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default CustomerTrips;
