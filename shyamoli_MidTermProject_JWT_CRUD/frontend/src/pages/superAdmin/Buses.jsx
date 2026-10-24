
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import DirectionsBusFilledIcon from "@mui/icons-material/DirectionsBusFilled";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getAllBuses,
  deleteBus,
} from "../../services/busService";

const getBusTypeLabel = (busType) => {
  const labels = {
    AC: "AC",
    NON_AC: "Non-AC",
    SLEEPER: "Sleeper",
    SEATER: "Seater",
  };

  return labels[busType] || busType || "Unspecified";
};

const Buses = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: buses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["buses"],
    queryFn: getAllBuses,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["buses"],
      });
    },
  });

  const handleDelete = (bus) => {
    const confirmed = window.confirm(
      `Delete GreenBus ${bus.busNumber}?`,
    );

    if (confirmed) {
      deleteMutation.mutate(bus._id);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "40vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: "#176B45" }} />
        <Typography color="text.secondary">
          Loading GreenBus fleet...
        </Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error?.response?.data?.message ||
          error?.message ||
          "Failed to load buses."}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1440, mx: "auto", pb: 4 }}>
      <Box
        sx={{
          mb: 4,
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          color: "#FFFFFF",
          background:
            "linear-gradient(120deg, #071832 0%, #102B4C 70%, #14532D 100%)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={3}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 58,
                height: 58,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: 2,
                bgcolor: "#22C55E",
              }}
            >
              <DirectionsBusFilledIcon
                sx={{ color: "#071832", fontSize: 36 }}
              />
            </Box>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.65rem", sm: "2.1rem" },
                }}
              >
                GreenBus Fleet
              </Typography>

              <Typography sx={{ mt: 0.75, color: "#D1FAE5" }}>
                Manage company buses and their categories.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/super-admin/buses/add")}
            sx={{
              alignSelf: { xs: "stretch", sm: "center" },
              py: 1.25,
              px: 2.5,
              bgcolor: "#22C55E",
              color: "#071832",
              fontWeight: 800,
              "&:hover": { bgcolor: "#4ADE80" },
            }}
          >
            Add Bus
          </Button>
        </Stack>

        <Box
          sx={{
            mt: 3,
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.1)",
          }}
        >
          <Typography sx={{ color: "#BBF7D0", fontWeight: 700 }}>
            {buses.length} {buses.length === 1 ? "bus" : "buses"} in fleet
          </Typography>
        </Box>
      </Box>

      {deleteMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {deleteMutation.error?.response?.data?.message ||
            deleteMutation.error?.message ||
            "Failed to delete bus."}
        </Alert>
      )}

      {buses.length === 0 ? (
        <Box
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "#FFFFFF",
            border: "1px dashed #CBD5E1",
          }}
        >
          <DirectionsBusFilledIcon
            sx={{ fontSize: 48, color: "#94A3B8", mb: 1 }}
          />

          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            No buses registered yet
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1, mb: 2.5 }}>
            Add your first GreenBus to start managing the fleet.
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/super-admin/buses/add")}
            sx={{ bgcolor: "#176B45" }}
          >
            Add First Bus
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {buses.map((bus) => (
            <Grid item xs={12} sm={6} xl={4} key={bus._id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid #E2E8F0",
                  borderRadius: 3,
                  transition: "transform 180ms ease, box-shadow 180ms ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
                  },
                }}
              >
                <Box
                  sx={{
                    p: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    bgcolor: "#F8FAFC",
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 2,
                      bgcolor: "#DCFCE7",
                    }}
                  >
                    <DirectionsBusFilledIcon
                      sx={{ color: "#166534", fontSize: 30 }}
                    />
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: "#0F172A" }}
                    >
                      GreenBus
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: "#64748B", overflowWrap: "anywhere" }}
                    >
                      Bus No. {bus.busNumber}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    label={bus.isActive ? "ACTIVE" : "INACTIVE"}
                    sx={{
                      fontWeight: 800,
                      color: bus.isActive ? "#15803D" : "#64748B",
                      bgcolor: bus.isActive ? "#DCFCE7" : "#E2E8F0",
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 2.5 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: "#64748B",
                      fontWeight: 800,
                      letterSpacing: 1,
                    }}
                  >
                    BUS CATEGORY
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{ mt: 0.25, mb: 2.5, fontWeight: 800 }}
                  >
                    {getBusTypeLabel(bus.busType)}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Total seats
                      </Typography>

                      <Typography sx={{ fontWeight: 700 }}>
                        {bus.totalSeats ?? "-"}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Available seats
                      </Typography>

                      <Typography sx={{ fontWeight: 700 }}>
                        {bus.availableSeats ?? "-"}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Box
                        sx={{
                          mt: 0.5,
                          p: 1.75,
                          borderRadius: 2,
                          bgcolor: "#F0FDF4",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "#166534" }}
                        >
                          Ticket price
                        </Typography>

                        <Typography
                          variant="h5"
                          sx={{ color: "#166534", fontWeight: 800 }}
                        >
                          ₹{Number(bus.ticketPrice || 0).toLocaleString("en-IN")}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EditOutlinedIcon />}
                      onClick={() =>
                        navigate(`/super-admin/buses/edit/${bus._id}`)
                      }
                      sx={{
                        py: 1,
                        fontWeight: 700,
                        borderColor: "#176B45",
                        color: "#176B45",
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon  />}
                      onClick={() => handleDelete(bus)}
                      disabled={deleteMutation.isPending}
                      sx={{ py: 1, fontWeight: 700 }}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Buses;
