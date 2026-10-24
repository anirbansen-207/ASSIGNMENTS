import { createBrowserRouter } from "react-router-dom";

// Public layout
import PublicLayout from "../layouts/PublicLayout";

// Protected layout
import ProtectedRoute from "../routes/ProtectedRoute";

// Authentication pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyOtp from "../pages/auth/VerifyOtp";
import About from "../pages/auth/About";

// Role based routes
import RoleRoute from "../routes/RoleRoute";
import { ROLES } from "../utils/roles";

// Protected Routes
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import BookingStaffDashboard from "../pages/bookingStaff/BookingStaffDashboard";
import DriverDashboard from "../pages/driver/DriverDashboard";
import SuperAdminDashboard from "../pages/superAdmin/SuperAdminDashboard";

// Layouts
import CustomerLayout from "../layouts/CustomerLayout";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import BookingStaffLayout from "../layouts/BookingStaffLayout";
import DriverLayout from "../layouts/DriverLayout";
// Pages
import Home from "../pages/Home";
import CustomerTrips from "../pages/customer/CustomerTrips";
import TripDetails from "../pages/customer/TripDetails";
import SeatSelection from "../pages/customer/SeatSelection";
import Payment from "../pages/customer/Payment";
import Ticket from "../pages/customer/Ticket";
import MyBookings from "../pages/customer/MyBookings";
import MyTickets from "../pages/customer/MyTickets";
import Routes from "../pages/superAdmin/Routes";
import AddRoute from "../pages/superAdmin/AddRoute";
import EditRoute from "../pages/superAdmin/EditRoute";
import Buses from "../pages/superAdmin/Buses";
import AddBus from "../pages/superAdmin/AddBus";
import EditBus from "../pages/superAdmin/EditBus";
import SeatLayouts from "../pages/superAdmin/SeatLayouts";
import AddSeatLayout from "../pages/superAdmin/AddSeatLayout";
import Drivers from "../pages/superAdmin/Drivers";
import AddDriver from "../pages/superAdmin/AddDriver";
import EditDriver from "../pages/superAdmin/EditDriver";
import Trips from "../pages/superAdmin/Trips";
import AddTrip from "../pages/superAdmin/AddTrip";
import EditTrip from "../pages/superAdmin/EditTrip";
import BookingStaff from "../pages/superAdmin/BookingStaff";
import AddBookingStaff from "../pages/superAdmin/AddBookingStaff";
import EditBookingStaff from "../pages/superAdmin/EditBookingStaff";
import Customers from "../pages/superAdmin/Customers";
import CustomerDetails from "../pages/superAdmin/CustomerDetails";
import Bookings from "../pages/superAdmin/Bookings";
import BookingDetails from "../pages/superAdmin/BookingDetails";
import CreateOfflineBooking from "../pages/bookingStaff/CreateOfflineBooking";
import BookingsDetails from "../pages/bookingStaff/BookingsDetails";
import PrintTicket from "../pages/bookingStaff/PrintTicket";

const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "verify-otp",
        element: <VerifyOtp />,
      },
      {
        path: "about",
        element: <About />,
      },
    ],
  },

  // Protected Routes
  {
    element: <ProtectedRoute />,

    // Pages inside children will be rendered
    // through the <Outlet /> of ProtectedRoute.
    children: [
      // customer role routes
      {
        element: <RoleRoute allowedRoles={[ROLES.CUSTOMER]} />,
        children: [
          {
            path: "/customer",
            element: <CustomerLayout />,
            children: [
              {
                index: true,
                element: <CustomerDashboard />,
              },
              {
                path: "trips",
                element: <CustomerTrips />,
              },
              {
                path: "trips/:tripId",
                element: <TripDetails />,
              },
              {
                path: "trips/:tripId/seats",
                element: <SeatSelection />,
              },
              {
                path: "payment",
                element: <Payment />,
              },
              {
                path: "ticket",
                element: <Ticket />,
              },
              {
                path: "bookings",
                element: <MyBookings />,
              },
              {
                path: "tickets",
                element: <MyTickets />,
              },
            ],
          },
        ],
      },

      // Booking Staff routes
      {
        element: <RoleRoute allowedRoles={[ROLES.BOOKING_STAFF]} />,
        children: [
          {
            path: "/booking-staff",
            element: <BookingStaffLayout />,
            children: [
              {
                index: true,
                element: <BookingStaffDashboard />,
              },
              {
                path: "create-booking",
                element: <CreateOfflineBooking />,
              },
              {
                path: "bookings",
                element: <BookingsDetails />,
              },
              {
                path: "print-ticket",
                element: <PrintTicket />,
              },
            ],
          },
        ],
      },

      // Driver routes
      {
        element: <RoleRoute allowedRoles={[ROLES.DRIVER]} />,
        children: [
          {
            path: "/driver",
            element: <DriverLayout />,
            children: [
              {
                index: true,
                element: <DriverDashboard />,
              },
            ],
          },
        ],
      },

      // Super Admin routes
      {
        element: <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]} />,
        children: [
          {
            path: "/super-admin",
            element: <SuperAdminLayout />,
            children: [
              {
                index: true,
                element: <SuperAdminDashboard />,
              },
              {
                path: "routes",
                element: <Routes />,
              },
              {
                path: "routes/add",
                element: <AddRoute />,
              },
              {
                path: "routes/edit/:routeId",
                element: <EditRoute />,
              },
              {
                path: "buses",
                element: <Buses />,
              },
              {
                path: "buses/add",
                element: <AddBus />,
              },
              {
                path: "buses/edit/:busId",
                element: <EditBus />,
              },
              {
                path: "seat-layouts",
                element: <SeatLayouts />,
              },
              {
                path: "seat-layout/add/:busId",
                element: <AddSeatLayout />,
              },
              {
                path: "drivers",
                element: <Drivers />,
              },
              {
                path: "drivers/add",
                element: <AddDriver />,
              },
              {
                path: "drivers/edit/:driverId",
                element: <EditDriver />,
              },
              {
                path: "trips",
                element: <Trips />,
              },
              {
                path: "trips/add",
                element: <AddTrip />,
              },
              {
                path: "trips/edit/:tripId",
                element: <EditTrip />,
              },
              {
                path: "booking-staff",
                element: <BookingStaff />,
              },
              {
                path: "booking-staff/add",
                element: <AddBookingStaff />,
              },
              {
                path: "booking-staff/edit/:bookingStaffId",
                element: <EditBookingStaff />,
              },
              {
                path: "customers",
                element: <Customers />,
              },
              {
                path: "customers/:customerId",
                element: <CustomerDetails />,
              },
              {
                path: "bookings",
                element: <Bookings />,
              },
              {
                path: "bookings/:bookingId",
                element: <BookingDetails />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
