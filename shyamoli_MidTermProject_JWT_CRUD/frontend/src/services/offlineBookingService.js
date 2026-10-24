
import axiosInstance from "./axios";

// Get all customers.
export const getAllCustomersForBooking = async () => {
  const response = await axiosInstance.get(
    "/api/super_admin/view_customers",
  );

  return response.data.data;
};

// Get all trips.
export const getAllTripsForBooking = async () => {
  const response = await axiosInstance.get("/api/trip/all_trips");

  return response.data.data;
};

// Get available seats or berths.
export const getAvailableSeatsForBooking = async (tripId) => {
  const response = await axiosInstance.get(
    `/api/booking/available_seats/${tripId}`,
  );

  return response.data.data;
};

// Create an offline booking.
export const createOfflineBooking = async (bookingData) => {
  const response = await axiosInstance.post(
    "/api/booking/create_booking",
    bookingData,
  );

  return response.data.data;
};

// Generate a ticket for an offline booking.
export const createStaffTicket = async (bookingId) => {
  const response = await axiosInstance.post(
    "/api/ticket/create_staff_ticket",
    { bookingId },
  );

  return response.data.data;
};
