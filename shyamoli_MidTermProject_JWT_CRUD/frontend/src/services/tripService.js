import axiosInstance from "./axios";

// Get all available trips
export const getAllTrips = async () => {
  const response = await axiosInstance.get("/api/trip/all_trips");

  return response.data.data;
};

// Get a single trip by trip ID
export const getSingleTrip = async (tripId) => {
  const response = await axiosInstance.get(`/api/trip/single_trip/${tripId}`);

  // Return the actual trip data.
  return response.data.data;
};
// Create a new trip
export const createTrip = async (tripData) => {
  const response = await axiosInstance.post("/api/trip/create_trip", tripData);

  return response.data.data;
};

// Update trip details
export const updateTrip = async ({ tripId, tripData }) => {
  const response = await axiosInstance.put(
    `/api/trip/update_trip/${tripId}`,
    tripData,
  );

  return response.data.data;
};

// Update trip status
export const updateTripStatus = async ({ tripId, tripStatus }) => {
  const response = await axiosInstance.patch(
    `/api/trip/update_status/${tripId}`,
    {
      tripStatus,
    },
  );

  return response.data.data;
};

// Cancel a trip
export const cancelTrip = async (tripId) => {
  const response = await axiosInstance.patch(`/api/trip/cancel_trip/${tripId}`);

  return response.data.data;
};

// Get completed trips
export const getCompletedTrips = async () => {
  const response = await axiosInstance.get("/api/trip/completed_trips");

  return response.data.data;
};

// Remove a completed or cancelled trip from the active trip list.
export const deleteTrip = async (tripId) => {
  const response = await axiosInstance.delete(`/api/trip/delete_trip/${tripId}`);

  return response.data.data;
};
