import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Paper,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

import {
  getAllTrips,
  updateTripStatus,
  cancelTrip,
  deleteTrip,
} from "../../services/tripService";

const Trips = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Get all trips
  const {
    data: trips,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["trips"],
    queryFn: getAllTrips,
  });

  // Update trip status
  const statusMutation = useMutation({
    mutationFn: updateTripStatus,

    onSuccess: () => {
      toast.success("Trip status updated");

      queryClient.invalidateQueries({
        queryKey: ["trips"],
      });
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update trip status",
      );
    },
  });

  // Cancel trip
  const cancelMutation = useMutation({
    mutationFn: cancelTrip,

    onSuccess: () => {
      toast.success("Trip cancelled");

      queryClient.invalidateQueries({
        queryKey: ["trips"],
      });
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to cancel trip");
    },
  });

  // Delete completed/cancelled trips. The backend also enforces this rule.
  const deleteMutation = useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      toast.success("Trip removed from Trip Management");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete trip");
    },
  });

  const filteredTrips = (trips || []).filter((trip) =>
    statusFilter === "ALL" ? true : trip.tripStatus === statusFilter,
  );

  // Loading
  if (isLoading) {
    return <Typography>Loading trips...</Typography>;
  }

  // Error
  if (isError) {
    return (
      <Typography color="error">
        Failed to load trips: {error.message}
      </Typography>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Trip Management</Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/super-admin/trips/add")}
        >
          Add Trip
        </Button>
      </Box>

      {/* Filter trips by their current status */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="trip-status-filter-label">Filter by status</InputLabel>
          <Select
            labelId="trip-status-filter-label"
            id="trip-status-filter"
            value={statusFilter}
            label="Filter by status"
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <MenuItem value="ALL">All Trips</MenuItem>
            <MenuItem value="SCHEDULED">Scheduled</MenuItem>
            <MenuItem value="ONGOING">Ongoing</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Trip Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Route</TableCell>
              <TableCell>Bus</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Travel Date</TableCell>
              <TableCell>Departure</TableCell>
              <TableCell>Arrival</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No trips found for this status.
                </TableCell>
              </TableRow>
            ) : (
              filteredTrips.map((trip) => (
                <TableRow key={trip._id}>
                  {/* Route */}
                  <TableCell>
                    {trip.routeId?.sourceCity} → {trip.routeId?.destinationCity}
                  </TableCell>

                  {/* Bus */}
                  <TableCell>
                    {trip.busId?.busName}
                    <br />
                    {trip.busId?.busNumber}
                  </TableCell>

                  {/* Driver */}
                  <TableCell>{trip.driverId?.name}</TableCell>

                  {/* Travel Date */}
                  <TableCell>
                    {new Date(trip.travelDate).toLocaleDateString()}
                  </TableCell>

                  {/* Departure */}
                  <TableCell>
                    {new Date(trip.departureTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>

                  {/* Arrival */}
                  <TableCell>
                    {new Date(trip.arrivalTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>

                  {/* Status */}
                  <TableCell>{trip.tripStatus}</TableCell>

                  {/* Actions */}
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() =>
                        navigate(`/super-admin/trips/edit/${trip._id}`)
                      }
                    >
                      Edit
                    </Button>

                    {trip.tripStatus === "SCHEDULED" && (
                      <Button
                        size="small"
                        color="success"
                        onClick={() =>
                          statusMutation.mutate({
                            tripId: trip._id,
                            tripStatus: "ONGOING",
                          })
                        }
                      >
                        Start
                      </Button>
                    )}

                    {trip.tripStatus === "ONGOING" && (
                      <Button
                        size="small"
                        color="success"
                        onClick={() =>
                          statusMutation.mutate({
                            tripId: trip._id,
                            tripStatus: "COMPLETED",
                          })
                        }
                      >
                        Complete
                      </Button>
                    )}

                    {(trip.tripStatus === "SCHEDULED" ||
                      trip.tripStatus === "ONGOING") && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to cancel this trip?",
                            )
                          ) {
                            cancelMutation.mutate(trip._id);
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    )}

                    {(trip.tripStatus === "COMPLETED" ||
                      trip.tripStatus === "CANCELLED") && (
                      <Button
                        size="small"
                        color="error"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Remove this ${trip.tripStatus.toLowerCase()} trip from Trip Management? Its booking and ticket history will be retained.`,
                            )
                          ) {
                            deleteMutation.mutate(trip._id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Trips;
