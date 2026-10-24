
import axiosInstance from "./axios";

// Get available seats or sleeper berths for a trip.
export const getAvailableSeats = async (tripId) => {
  const response = await axiosInstance.get(
    `/api/booking/available_seats/${tripId}`,
  );

  return response.data.data;
};

// Create a booking.
export const createBooking = async (bookingData) => {
  const response = await axiosInstance.post(
    "/api/booking/create_booking",
    bookingData,
  );

  return response.data.data;
};
