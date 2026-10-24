
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";

import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import RouteIcon from "@mui/icons-material/Route";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import SearchIcon from "@mui/icons-material/Search";
import PaymentIcon from "@mui/icons-material/Payment";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GroupsIcon from "@mui/icons-material/Groups";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SpeedIcon from "@mui/icons-material/Speed";

import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/roles";
import busHero from "../../assets/bus-hero.png";

const GREEN = "#16c172";
const DARK_GREEN = "#15803d";
const NAVY = "#071a35";
const TEXT = "#0b1b35";
const MUTED = "#64748b";

const features = [
  {
    icon: <DirectionsBusIcon />,
    title: "Bus Management",
    description:
      "Manage bus details, seating capacity, bus types and vehicle information from one place.",
  },
  {
    icon: <RouteIcon />,
    title: "Route Management",
    description:
      "Organize routes, source and destination cities, and the travel information passengers need.",
  },
  {
    icon: <PersonIcon />,
    title: "Driver Management",
    description:
      "Maintain driver information and organize driver assignments for scheduled trips.",
  },
  {
    icon: <CalendarMonthIcon />,
    title: "Trip Scheduling",
    description:
      "Create and manage trips with travel dates, departure times, arrival times and route details.",
  },
  {
    icon: <EventSeatIcon />,
    title: "Seat Booking",
    description:
      "Let customers review seat availability and select their preferred seats before booking.",
  },
  {
    icon: <ConfirmationNumberIcon />,
    title: "Digital Tickets",
    description:
      "Generate digital tickets after successful bookings so customers can access their ticket details.",
  },
];

const journeySteps = [
  {
    number: "01",
    icon: <SearchIcon />,
    title: "Explore Bus Trips",
    description:
      "Browse available trips and review routes, travel dates, departure times and ticket prices.",
  },
  {
    number: "02",
    icon: <EventSeatIcon />,
    title: "Choose Your Seat",
    description:
      "View the seat layout and select an available seat that suits your journey.",
  },
  {
    number: "03",
    icon: <PaymentIcon />,
    title: "Complete Your Booking",
    description:
      "Follow the booking process and complete the required payment for your reservation.",
  },
  {
    number: "04",
    icon: <ConfirmationNumberIcon />,
    title: "Access Your Ticket",
    description:
      "View your booking details and access your digital ticket after successful booking.",
  },
];

const userRoles = [
  {
    icon: <AdminPanelSettingsIcon />,
    title: "Super Admin",
    color: "#1877f2",
    background: "#eaf3ff",
    description:
      "Oversees the platform and manages its main operational resources.",
    responsibilities: [
      "Manage buses and seat layouts",
      "Manage routes and trip schedules",
      "Manage drivers and booking staff",
      "Review customer and booking information",
    ],
  },
  {
    icon: <SupportAgentIcon />,
    title: "Booking Staff",
    color: "#b77908",
    background: "#fff6e4",
    description:
      "Handles customer bookings and supports offline booking operations.",
    responsibilities: [
      "Create offline bookings",
      "Manage booking information",
      "Generate tickets for eligible bookings",
      "Assist customers with booking enquiries",
    ],
  },
  {
    icon: <GroupsIcon />,
    title: "Customers",
    color: DARK_GREEN,
    background: "#e8f9ef",
    description:
      "Searches for trips and manages personal bookings and tickets.",
    responsibilities: [
      "Browse available bus trips",
      "Select seats and book journeys",
      "Complete online payments",
      "Access bookings and digital tickets",
    ],
  },
];

const benefits = [
  {
    icon: <SpeedIcon />,
    title: "Organized Operations",
    description:
      "Bring important bus, route, trip and booking information together in one platform.",
  },
  {
    icon: <VerifiedUserIcon />,
    title: "Role-Based Access",
    description:
      "Provide different operational features according to each user's assigned role.",
  },
  {
    icon: <EventSeatIcon />,
    title: "Convenient Booking",
    description:
      "Make it easier for customers to review trips, choose seats and manage reservations.",
  },
];

const SectionLabel = ({ children, dark = false }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 1,
      px: 1.7,
      py: 0.8,
      mb: 2,
      borderRadius: 50,
      color: dark ? "#d1fae5" : DARK_GREEN,
      bgcolor: dark
        ? "rgba(22,193,114,0.15)"
        : "#dcfce7",
      border: dark
        ? "1px solid rgba(22,193,114,0.25)"
        : "1px solid #bbf7d0",
    }}
  >
    <DirectionsBusIcon sx={{ fontSize: 17 }} />
    <Typography
      component="span"
      sx={{
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.3,
      }}
    >
      {children}
    </Typography>
  </Box>
);

const SectionHeading = ({
  firstLine,
  highlight,
  description,
  dark = false,
}) => (
  <Box sx={{ textAlign: "center", maxWidth: 760, mx: "auto" }}>
    <Typography
      component="h2"
      sx={{
        fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.65rem" },
        fontWeight: 900,
        letterSpacing: "-0.8px",
        lineHeight: 1.2,
        color: dark ? "#ffffff" : TEXT,
      }}
    >
      {firstLine}{" "}
      <Box component="span" sx={{ color: GREEN }}>
        {highlight}
      </Box>
    </Typography>

    {description && (
      <Typography
        sx={{
          mt: 1.5,
          fontSize: { xs: 14, md: 16 },
          lineHeight: 1.8,
          color: dark ? "rgba(255,255,255,0.72)" : MUTED,
        }}
      >
        {description}
      </Typography>
    )}
  </Box>
);

const About = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goToDashboard = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    switch (user.role) {
      case ROLES.SUPER_ADMIN:
        navigate("/super-admin");
        break;

      case ROLES.BOOKING_STAFF:
        navigate("/booking-staff");
        break;

      case ROLES.CUSTOMER:
        navigate("/customer");
        break;

      case ROLES.DRIVER:
        navigate("/driver");
        break;

      default:
        navigate("/login");
    }
  };

  const goToBooking = () => {
    if (user?.role === ROLES.CUSTOMER) {
      navigate("/customer/trips");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    goToDashboard();
  };

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        bgcolor: "#f7fafc",
        color: TEXT,
      }}
    >
      {/* HERO SECTION */}
      <Box
        component="section"
        sx={{
          position: "relative",
          isolation: "isolate",
          minHeight: { xs: 540, sm: 560, md: 590 },
          display: "flex",
          alignItems: "center",
          backgroundImage: `url(${busHero})`,
          backgroundSize: "cover",
          backgroundPosition: { xs: "62% center", md: "center 54%" },
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: -1,
            background:
              "linear-gradient(105deg, rgba(4,19,42,0.98) 0%, rgba(4,19,42,0.93) 40%, rgba(4,19,42,0.63) 72%, rgba(4,19,42,0.30) 100%)",
          },
        }}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 6, md: 8 } }}>
          <Box
            sx={{
              maxWidth: 790,
              color: "#ffffff",
            }}
          >
            <SectionLabel dark>ABOUT GREENBUS</SectionLabel>

            <Typography
              component="h1"
              sx={{
                fontSize: {
                  xs: "2.45rem",
                  sm: "3.2rem",
                  md: "4rem",
                  lg: "4.4rem",
                },
                fontWeight: 900,
                letterSpacing: { xs: "-1px", md: "-2px" },
                lineHeight: 1.12,
              }}
            >
              Smart Bus Management
              <Box
                component="span"
                sx={{
                  display: "block",
                  color: GREEN,
                }}
              >
                for a Better Journey
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: 2.5,
                maxWidth: 650,
                color: "rgba(255,255,255,0.86)",
                fontSize: { xs: 15, md: 17 },
                lineHeight: 1.85,
              }}
            >
              GreenBus is an all-in-one bus booking and management
              platform designed to organize transport operations,
              simplify reservations and help passengers manage their
              journeys through one convenient system.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, minmax(0, 1fr))",
                },
                gap: { xs: 2, sm: 3 },
                mt: 4,
                maxWidth: 740,
              }}
            >
              {[
                {
                  icon: <GroupsIcon />,
                  title: "Multiple Roles",
                  subtitle: "Admin, Staff & Customers",
                },
                {
                  icon: <DirectionsBusIcon />,
                  title: "Complete Operations",
                  subtitle: "Routes, trips & buses",
                },
                {
                  icon: <VerifiedUserIcon />,
                  title: "Organized Access",
                  subtitle: "Role-based features",
                },
              ].map((item) => (
                <Box
                  key={item.title}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.4,
                  }}
                >
                  <Box
                    sx={{
                      color: "#a7f3d0",
                      display: "flex",
                      "& svg": { fontSize: 31 },
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.72)",
                        fontSize: 12,
                        mt: 0.4,
                      }}
                    >
                      {item.subtitle}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                mt: 4,
              }}
            >
              <Button
                variant="contained"
                onClick={goToBooking}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: 3,
                  py: 1.35,
                  borderRadius: 2,
                  bgcolor: GREEN,
                  color: "#052b1b",
                  fontWeight: 900,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#4ade80" },
                }}
              >
                Explore Bus Trips
              </Button>

              <Button
                variant="outlined"
                onClick={() =>
                  user ? goToDashboard() : navigate("/register")
                }
                sx={{
                  px: 3,
                  py: 1.35,
                  borderRadius: 2,
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.55)",
                  fontWeight: 800,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#ffffff",
                    bgcolor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                {user ? "Go to Dashboard" : "Create an Account"}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* OUR STORY */}
      <Box
        component="section"
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: "#ffffff",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "1.1fr 0.9fr",
              },
              gap: { xs: 4, md: 6 },
              alignItems: "center",
            }}
          >
            <Box>
              <SectionLabel>OUR STORY</SectionLabel>

              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: "2rem", md: "2.65rem" },
                  fontWeight: 900,
                  letterSpacing: "-1px",
                  lineHeight: 1.2,
                }}
              >
                About{" "}
                <Box component="span" sx={{ color: DARK_GREEN }}>
                  GreenBus
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 2.2,
                  color: "#475569",
                  lineHeight: 1.9,
                  fontSize: 15,
                }}
              >
                Managing bus transportation involves many connected
                activities, from maintaining buses and scheduling trips
                to organizing seats, bookings and tickets. GreenBus
                brings these activities together in one centralized
                platform.
              </Typography>

              <Typography
                sx={{
                  mt: 1.5,
                  color: "#475569",
                  lineHeight: 1.9,
                  fontSize: 15,
                }}
              >
                Our goal is to make transport operations easier to
                organize and bus reservations simpler to manage. With
                dedicated access for Super Admins, Booking Staff,
                Drivers and Customers, GreenBus brings the right tools
                closer to the people who need them.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.2,
                  mt: 2.5,
                }}
              >
                <CheckCircleIcon
                  sx={{ color: DARK_GREEN, mt: 0.3, flexShrink: 0 }}
                />
                <Typography
                  sx={{
                    color: TEXT,
                    fontWeight: 700,
                    lineHeight: 1.7,
                  }}
                >
                  One platform for bus operations, reservations and
                  digital ticket management.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                position: "relative",
                minHeight: { xs: 280, md: 350 },
                borderRadius: 4,
                overflow: "hidden",
                backgroundImage: `url(${busHero})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "0 20px 45px rgba(7,26,53,0.18)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, transparent 25%, rgba(4,19,42,0.9) 100%)",
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  left: { xs: 16, md: 24 },
                  right: { xs: 16, md: 24 },
                  bottom: { xs: 16, md: 24 },
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  color: "#ffffff",
                  bgcolor: "rgba(4,19,42,0.76)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 35,
                    fontWeight: 900,
                    color: GREEN,
                    lineHeight: 1,
                    mb: 1,
                  }}
                >
                  “
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 16, md: 19 },
                    lineHeight: 1.6,
                    fontWeight: 800,
                  }}
                >
                  Making bus travel simpler to manage and easier to
                  experience.
                </Typography>
                <Box
                  sx={{
                    width: 42,
                    height: 3,
                    bgcolor: GREEN,
                    borderRadius: 5,
                    mt: 2,
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* MISSION AND VISION */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2.5,
              mt: { xs: 5, md: 6 },
            }}
          >
            {[
              {
                icon: <TrackChangesIcon />,
                title: "Our Mission",
                color: DARK_GREEN,
                background: "#eaf9f0",
                description:
                  "To provide a practical, organized and user-friendly platform that simplifies bus operations and helps customers manage their travel bookings with confidence.",
              },
              {
                icon: <VisibilityIcon />,
                title: "Our Vision",
                color: "#1877f2",
                background: "#eaf3ff",
                description:
                  "To make bus management and booking more accessible through a connected digital experience for transport operators, staff, drivers and passengers.",
              },
            ].map((item) => (
              <Box
                key={item.title}
                sx={{
                  display: "flex",
                  gap: { xs: 2, md: 2.5 },
                  p: { xs: 2.5, md: 3.2 },
                  borderRadius: 3,
                  bgcolor: item.background,
                  border: "1px solid rgba(15,23,42,0.04)",
                }}
              >
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    flexShrink: 0,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#ffffff",
                    color: item.color,
                    "& svg": { fontSize: 30 },
                  }}
                >
                  {item.icon}
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: 19,
                      color: item.color,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 1,
                      color: "#475569",
                      lineHeight: 1.8,
                      fontSize: 14,
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* PLATFORM FEATURES */}
      <Box
        component="section"
        sx={{
          py: { xs: 6, md: 8 },
          background:
            "linear-gradient(180deg, #f4f9ff 0%, #eef8f3 100%)",
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <SectionLabel>OUR FEATURES</SectionLabel>

            <SectionHeading
              firstLine="A Complete"
              highlight="Bus Management Platform"
              description="Everything needed to organize bus operations and make booking more convenient, all in one place."
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                xl: "repeat(6, minmax(0, 1fr))",
              },
              gap: 2,
              alignItems: "stretch",
            }}
          >
            {features.map((feature) => (
              <Box
                key={feature.title}
                sx={{
                  minWidth: 0,
                  p: { xs: 2.5, md: 2.2 },
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  border: "1px solid #e5edf5",
                  boxShadow: "0 4px 14px rgba(15,23,42,0.035)",
                  transition: "transform .2s, box-shadow .2s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 14px 28px rgba(15,23,42,0.09)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    color: "#1877f2",
                    bgcolor: "#eaf3ff",
                    mb: 2,
                    "& svg": { fontSize: 27 },
                  }}
                >
                  {feature.icon}
                </Box>

                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: TEXT,
                    lineHeight: 1.4,
                    mb: 1,
                  }}
                >
                  {feature.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.75,
                    color: MUTED,
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* HOW IT WORKS */}
      <Box
        component="section"
        sx={{
          position: "relative",
          overflow: "hidden",
          py: { xs: 6, md: 8 },
          color: "#ffffff",
          bgcolor: NAVY,
          backgroundImage: `
            linear-gradient(115deg, rgba(4,19,42,0.98), rgba(4,30,53,0.94)),
            url(${busHero})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <SectionLabel dark>HOW IT WORKS</SectionLabel>

            <SectionHeading
              dark
              firstLine="Your Journey in Just a"
              highlight="Few Steps"
              description="From exploring available trips to accessing your ticket, GreenBus keeps the process straightforward."
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2.5,
            }}
          >
            {journeySteps.map((step) => (
              <Box
                key={step.number}
                sx={{
                  position: "relative",
                  minWidth: 0,
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.055)",
                  border: "1px solid rgba(255,255,255,0.13)",
                  textAlign: "center",
                  transition: "background .2s, transform .2s",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.09)",
                    transform: "translateY(-3px)",
                  },
                }}
              >
                <Typography
                  sx={{
                    color: GREEN,
                    fontSize: 13,
                    fontWeight: 900,
                    letterSpacing: 1,
                  }}
                >
                  STEP {step.number}
                </Typography>

                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    mx: "auto",
                    my: 2,
                    color: "#ffffff",
                    bgcolor: "rgba(22,193,114,0.18)",
                    border: "1px solid rgba(22,193,114,0.35)",
                    "& svg": { fontSize: 30 },
                  }}
                >
                  {step.icon}
                </Box>

                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 17,
                    mb: 1,
                  }}
                >
                  {step.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.75,
                    color: "rgba(255,255,255,0.72)",
                  }}
                >
                  {step.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* USER ROLES */}
      <Box
        component="section"
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: "#ffffff",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 4.5 }}>
            <SectionLabel>OUR USERS</SectionLabel>

            <SectionHeading
              firstLine="Multiple Roles,"
              highlight="One Platform"
              description="GreenBus provides dedicated features for the different people involved in bus operations and travel."
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2.5,
              alignItems: "stretch",
            }}
          >
            {userRoles.map((role) => (
              <Box
                key={role.title}
                sx={{
                  minWidth: 0,
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  bgcolor: role.background,
                  border: "1px solid rgba(15,23,42,0.04)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      flexShrink: 0,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "#ffffff",
                      color: role.color,
                      "& svg": { fontSize: 28 },
                    }}
                  >
                    {role.icon}
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 19,
                      fontWeight: 900,
                      color: role.color,
                    }}
                  >
                    {role.title}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    color: "#475569",
                    fontSize: 14,
                    lineHeight: 1.75,
                    mb: 2,
                  }}
                >
                  {role.description}
                </Typography>

                <Box sx={{ display: "grid", gap: 1.2 }}>
                  {role.responsibilities.map((responsibility) => (
                    <Box
                      key={responsibility}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                      }}
                    >
                      <CheckCircleIcon
                        sx={{
                          color: role.color,
                          fontSize: 18,
                          mt: 0.25,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: "#334155",
                        }}
                      >
                        {responsibility}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* WHY GREENBUS */}
      <Box
        component="section"
        sx={{
          py: { xs: 6, md: 8 },
          background: "linear-gradient(180deg, #f7fbff 0%, #eef8f3 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 4.5 }}>
            <SectionLabel>WHY GREENBUS</SectionLabel>

            <SectionHeading
              firstLine="Designed for"
              highlight="Better Bus Management"
              description="A centralized digital experience that helps organize everyday transport activities and makes booking more convenient."
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2.5,
            }}
          >
            {benefits.map((benefit) => (
              <Box
                key={benefit.title}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  p: { xs: 2.5, md: 3 },
                  bgcolor: "#ffffff",
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                }}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    color: DARK_GREEN,
                    bgcolor: "#dcfce7",
                    borderRadius: 2,
                    "& svg": { fontSize: 27 },
                  }}
                >
                  {benefit.icon}
                </Box>

                <Box>
                  <Typography
                    sx={{
                      color: TEXT,
                      fontWeight: 900,
                      fontSize: 17,
                      mb: 1,
                    }}
                  >
                    {benefit.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: MUTED,
                      fontSize: 14,
                      lineHeight: 1.75,
                    }}
                  >
                    {benefit.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* FINAL CALL TO ACTION */}
      <Box
        component="section"
        sx={{
          px: { xs: 2, md: 4 },
          pb: { xs: 3, md: 4 },
          bgcolor: "#eef8f3",
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <Box
            sx={{
              position: "relative",
              isolation: "isolate",
              overflow: "hidden",
              borderRadius: { xs: 3, md: 4 },
              px: { xs: 3, sm: 5, md: 7 },
              py: { xs: 4, md: 5 },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 3,
              color: "#ffffff",
              backgroundImage: `url(${busHero})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                zIndex: -1,
                background:
                  "linear-gradient(100deg, rgba(4,19,42,0.98), rgba(4,19,42,0.82))",
              },
            }}
          >
            <Box sx={{ maxWidth: 670 }}>
              <Typography
                component="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.8rem", md: "2.35rem" },
                  lineHeight: 1.25,
                }}
              >
                Travel Smarter with{" "}
                <Box component="span" sx={{ color: GREEN }}>
                  GreenBus
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 1.3,
                  color: "rgba(255,255,255,0.8)",
                  lineHeight: 1.8,
                  fontSize: { xs: 14, md: 16 },
                }}
              >
                Explore available trips, organize bookings and enjoy
                a more convenient way to manage your bus journey.
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={goToBooking}
              endIcon={<ArrowForwardIcon />}
              sx={{
                flexShrink: 0,
                px: 3.2,
                py: 1.45,
                borderRadius: 50,
                bgcolor: GREEN,
                color: "#052b1b",
                fontWeight: 900,
                textTransform: "none",
                whiteSpace: "nowrap",
                "&:hover": {
                  bgcolor: "#4ade80",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default About;
