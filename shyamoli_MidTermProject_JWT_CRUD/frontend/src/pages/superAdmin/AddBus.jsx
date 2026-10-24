
import { useState } from "react";
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
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { createBus } from "../../services/busService";

const AddBus = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    busNumber: "",
    busType: "",
    totalSeats: "",
    ticketPrice: "",
  });

  const createMutation = useMutation({
    mutationFn: createBus,
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

    createMutation.mutate({
      busNumber: formData.busNumber.trim(),
      busName: "GreenBus",
      busType: formData.busType,
      totalSeats: Number(formData.totalSeats),
      ticketPrice: Number(formData.ticketPrice),
    });
  };

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
              Add a GreenBus
            </Typography>

            <Typography sx={{ mt: 0.5, color: "#D1FAE5" }}>
              Register a company bus and choose its category.
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
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          Bus information
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          The company name is fixed. Enter the registration number,
          bus category, seating capacity and ticket price.
        </Typography>

        {createMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {createMutation.error?.response?.data?.message ||
              createMutation.error?.message ||
              "Failed to create bus. Please try again."}
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
            fullWidth
            disabled
            helperText="Fixed company name"
          />

          <TextField
            label="Bus Number"
            name="busNumber"
            value={formData.busNumber}
            onChange={handleChange}
            placeholder="e.g. WB 1234"
            required
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
            label="Total Seats"
            name="totalSeats"
            type="number"
            value={formData.totalSeats}
            onChange={handleChange}
            required
            fullWidth
            slotProps={{
              htmlInput: { min: 1, step: 1 },
            }}
          />

          <TextField
            label="Ticket Price (₹)"
            name="ticketPrice"
            type="number"
            value={formData.ticketPrice}
            onChange={handleChange}
            required
            fullWidth
            slotProps={{
              htmlInput: { min: 0, step: "0.01" },
            }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ gridColumn: "1 / -1", mt: 1 }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending}
              sx={{
                py: 1.25,
                px: 3,
                fontWeight: 700,
                bgcolor: "#176B45",
                "&:hover": { bgcolor: "#14532D" },
              }}
            >
              {createMutation.isPending ? "Creating..." : "Create Bus"}
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/super-admin/buses")}
              disabled={createMutation.isPending}
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

export default AddBus;
