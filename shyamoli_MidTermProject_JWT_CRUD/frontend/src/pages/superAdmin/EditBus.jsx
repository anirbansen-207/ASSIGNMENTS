
import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import DirectionsBusFilledIcon from "@mui/icons-material/DirectionsBusFilled";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import {
  getSingleBus,
  updateBus,
} from "../../services/busService";

const EditBus = () => {
  const navigate = useNavigate();
  const { busId } = useParams();

  const [formData, setFormData] = useState({
    busType: "",
    ticketPrice: "",
  });

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
    if (bus) {
      setFormData({
        busType: bus.busType || "",
        ticketPrice: bus.ticketPrice ?? "",
      });
    }
  }, [bus]);

  const updateMutation = useMutation({
    mutationFn: updateBus,
    onSuccess: () => {
      navigate("/super-admin/buses");
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    updateMutation.mutate({
      busId,
      busData: {
        busName: "GreenBus",
        busType: formData.busType,
        ticketPrice: Number(formData.ticketPrice),
      },
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography>Loading bus details...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error?.response?.data?.message ||
          error?.message ||
          "Failed to load bus."}
      </Alert>
    );
  }

  if (!bus) {
    return <Alert severity="warning">Bus not found.</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 850, mx: "auto", pb: 4 }}>
      <Box
        sx={{
          p: { xs: 2.5, sm: 4 },
          mb: 3,
          borderRadius: 3,
          color: "#FFFFFF",
          background:
            "linear-gradient(120deg, #071832 0%, #14532D 100%)",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 56,
              height: 56,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              bgcolor: "#22C55E",
            }}
          >
            <DirectionsBusFilledIcon
              sx={{ color: "#071832", fontSize: 34 }}
            />
          </Box>

          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Edit GreenBus
            </Typography>

            <Typography sx={{ mt: 0.5, color: "#D1FAE5" }}>
              Update the bus category and ticket price.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 4 },
          border: "1px solid #E2E8F0",
          borderRadius: 3,
        }}
      >
        {updateMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {updateMutation.error?.response?.data?.message ||
              updateMutation.error?.message ||
              "Failed to update bus."}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2.5,
          }}
        >
          <TextField
            label="Bus Name"
            value="GreenBus"
            disabled
            fullWidth
            helperText="Fixed company name"
          />

          <TextField
            label="Bus Number"
            value={bus.busNumber || ""}
            disabled
            fullWidth
          />

          <TextField
            select
            label="Bus Category"
            name="busType"
            value={formData.busType}
            onChange={handleChange}
            required
            fullWidth
          >
            <MenuItem value="AC">AC</MenuItem>
            <MenuItem value="NON_AC">Non-AC</MenuItem>
            <MenuItem value="SLEEPER">Sleeper</MenuItem>
            <MenuItem value="SEATER">Seater</MenuItem>
          </TextField>

          <TextField
            label="Ticket Price (₹)"
            type="number"
            name="ticketPrice"
            value={formData.ticketPrice}
            onChange={handleChange}
            required
            fullWidth
            slotProps={{
              htmlInput: { min: 0, step: "0.01" },
            }}
          />

          <TextField
            label="Total Seats"
            value={bus.totalSeats ?? ""}
            disabled
            fullWidth
          />

          <TextField
            label="Available Seats"
            value={bus.availableSeats ?? ""}
            disabled
            fullWidth
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ gridColumn: "1 / -1", mt: 1 }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={updateMutation.isPending}
              sx={{
                py: 1.25,
                px: 3,
                fontWeight: 700,
                bgcolor: "#176B45",
                "&:hover": { bgcolor: "#14532D" },
              }}
            >
              {updateMutation.isPending ? "Updating..." : "Update Bus"}
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/super-admin/buses")}
              disabled={updateMutation.isPending}
              sx={{ py: 1.25, px: 3 }}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditBus;
