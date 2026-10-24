
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import SearchIcon from "@mui/icons-material/Search";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { useAuth } from "../context/AuthContext";
import busHero from "../assets/bus-hero.png";

const whyGreenBus = [
  {
    title: "Safe & Reliable Travel",
    description:
      "Explore scheduled journeys with clear route information and organized bus services.",
    image:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=85",
    alt: "Passenger bus ready for a journey",
    icon: <DirectionsBusIcon />,
  },
  {
    title: "Comfortable Journey",
    description:
      "Review available trips and choose a seat that suits you before confirming your journey.",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=85",
    alt: "Modern passenger bus",
    icon: <EventSeatIcon />,
  },
  {
    title: "Easy & Digital Booking",
    description:
      "Book online and access your booking details and digital ticket conveniently.",
    image:
      "https://images.unsplash.com/photo-1512427691650-1f7b7e8e7c9b?auto=format&fit=crop&w=900&q=85",
    alt: "Digital services",
    icon: <ConfirmationNumberIcon />,
  },
];

// Only the four bus categories supported by the GreenBus admin form.
// Facilities are descriptive examples, not guarantees for every individual bus.
const busTypes = [
  {
    name: "Sleeper",
    subtitle: "Rest during your journey",
    description:
      "Choose a sleeper bus on routes where berth-style seating is available, especially for longer journeys.",
    image:
      "https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?auto=format&fit=crop&w=900&q=85",
    facilities: [
      "Sleeping berths",
      "Suitable for longer journeys",
      "Route-specific amenities",
      "Digital ticket access",
    ],
    badge: "Sleeper Berths",
  },
  {
    name: "AC",
    subtitle: "A cooler journey",
    description:
      "Travel in an air-conditioned bus for a more comfortable ride, especially on longer routes.",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=85",
    facilities: [
      "Air-conditioned cabin",
      "Passenger seating",
      "Scheduled route service",
      "Digital ticket access",
    ],
    badge: "Air Conditioned",
  },
  {
    name: "Non-AC",
    subtitle: "Simple, practical travel",
    description:
      "A practical option for passengers looking for straightforward bus travel without air conditioning.",
    image:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=85",
    facilities: [
      "Non-air-conditioned cabin",
      "Passenger seating",
      "Scheduled route service",
      "Digital ticket access",
    ],
    badge: "Non-AC Travel",
  },
  {
    name: "Seater",
    subtitle: "Everyday bus travel",
    description:
      "A familiar seating layout for regular trips between cities and destinations.",
    image:
      "https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=900&q=85",
    facilities: [
      "Individual passenger seats",
      "Seat selection where available",
      "Scheduled route service",
      "Digital ticket access",
    ],
    badge: "Seating",
  },
];

const journeyFeatures = [
  {
    number: "01",
    title: "Explore Bus Routes",
    description:
      "Discover available buses and compare departure, arrival, and route details.",
    image:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "02",
    title: "Choose Your Seat",
    description:
      "Review seat availability and select your preferred seat before booking.",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "03",
    title: "Manage Your Tickets",
    description:
      "Return to your booking details and digital ticket whenever you need them.",
    image:
      "https://images.unsplash.com/photo-1512427691650-1f7b7e8e7c9b?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "04",
    title: "Smarter Bus Operations",
    description:
      "Authorized staff can manage buses, routes, schedules, drivers, and bookings.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goToDashboard = () => {
    if (user?.role === "customer") navigate("/customer");
    else if (user?.role === "booking_staff") navigate("/booking-staff");
    else if (user?.role === "driver") navigate("/driver");
    else if (user?.role === "super_admin") navigate("/super-admin");
  };

  const goToBooking = () => {
    if (user?.role === "customer") {
      navigate("/customer/trips");
    } else if (user) {
      goToDashboard();
    } else {
      navigate("/login");
    }
  };

  return (
    <Box sx={{ width: "100%", overflow: "hidden", bgcolor: "#f7fafc" }}>
      {/* Hero banner */}
      <Box
        sx={{
          minHeight: { xs: 570, sm: 610, md: 650 },
          backgroundImage: `url(${busHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          display: "flex",
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(5,18,42,.96) 0%, rgba(5,18,42,.82) 42%, rgba(5,18,42,.20) 100%)",
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, py: 7 }}>
          <Box sx={{ maxWidth: 680, color: "white" }}>
            <Typography
              sx={{
                color: "#fbbf24",
                fontWeight: 800,
                letterSpacing: 2.5,
                fontSize: 13,
              }}
            >
              YOUR JOURNEY STARTS HERE
            </Typography>

            <Typography
              component="h1"
              sx={{
                fontWeight: 800,
                mt: 1.5,
                fontSize: { xs: "2.7rem", sm: "3.7rem", md: "4.6rem" },
                lineHeight: 1.05,
              }}
            >
              Travel Smarter
              <br />
              with{" "}
              <Box component="span" sx={{ color: "#4ade80" }}>
                GreenBus
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: 2.5,
                maxWidth: 570,
                fontSize: { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.8,
                color: "rgba(255,255,255,.85)",
              }}
            >
              We own and operate our own fleet of buses, providing safe, comfortable and reliable journeys with convenient seat bookings and digital tickets.
            </Typography>

            {!user ? (
              <Box sx={{ display: "flex", gap: 1.5, mt: 3.5, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/login")}
                  sx={{
                    px: 3,
                    py: 1.25,
                    bgcolor: "#fbbf24",
                    color: "#08152f",
                    fontWeight: 800,
                    borderRadius: 2,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#f59e0b" },
                  }}
                >
                  Book Your Ticket →
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate("/register")}
                  sx={{
                    px: 3,
                    py: 1.25,
                    color: "white",
                    borderColor: "rgba(255,255,255,.65)",
                    borderRadius: 2,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,.08)",
                    },
                  }}
                >
                  Create Account
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                onClick={goToDashboard}
                sx={{
                  mt: 3.5,
                  px: 3,
                  py: 1.25,
                  bgcolor: "#fbbf24",
                  color: "#08152f",
                  fontWeight: 800,
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#f59e0b" },
                }}
              >
                Go to Dashboard
              </Button>
            )}

            <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", mt: 3 }}>
              {[
                { icon: <DirectionsBusIcon />, title: "Bus Management" },
                { icon: <EventSeatIcon />, title: "Easy Seat Booking" },
                { icon: <ConfirmationNumberIcon />, title: "Digital Tickets" },
              ].map((item) => (
                <Box
                  key={item.title}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.6,
                    py: 1.2,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,.09)",
                    border: "1px solid rgba(255,255,255,.16)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Box sx={{ display: "flex", color: "#fbbf24" }}>
                    {item.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                    {item.title}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Why GreenBus */}
      <Box
        component="section"
        sx={{
          py: { xs: 5, md: 7 },
          background: "linear-gradient(180deg,#f7fbff 0%,#edf7f2 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            component="h2"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              fontSize: { xs: "1.8rem", md: "2.4rem" },
              color: "#0b1b35",
            }}
          >
            Why{" "}
            <Box component="span" sx={{ color: "#15803d" }}>
              GreenBus
            </Box>
            ?
          </Typography>

          <Typography
            sx={{ textAlign: "center", mt: 1, mb: 3.5, color: "#64748b" }}
          >
            We make your bus journey safer, easier and more comfortable.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 2, md: 2.5 },
              alignItems: "stretch",
            }}
          >
            {whyGreenBus.map((item) => (
              <Card
                key={item.title}
                elevation={0}
                sx={{
                  minWidth: 0,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  transition: "transform .2s, box-shadow .2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 30px rgba(15,23,42,.10)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={item.image}
                  alt={item.alt}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = busHero;
                  }}
                  sx={{
                    height: { xs: 180, md: 175 },
                    width: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                <CardContent
                  sx={{ display: "flex", gap: 1.5, p: 2.5, flexGrow: 1 }}
                >
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 44,
                      height: 44,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "50%",
                      color: "#15803d",
                      bgcolor: "#dcfce7",
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{ fontWeight: 800, color: "#0f172a", mb: 0.75 }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 14, lineHeight: 1.65, color: "#64748b" }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* GreenBus fleet and bus categories */}
      <Box
        component="section"
        id="bus-types"
        sx={{
          py: { xs: 5, md: 8 },
          bgcolor: "#071631",
          color: "#ffffff",
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "flex-end" },
              justifyContent: "space-between",
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Chip
                icon={<DirectionsBusIcon />}
                label="THE GREENBUS FLEET"
                sx={{
                  mb: 1.5,
                  color: "#bbf7d0",
                  bgcolor: "rgba(34,197,94,.12)",
                  border: "1px solid rgba(74,222,128,.35)",
                  fontWeight: 800,
                  "& .MuiChip-icon": { color: "#4ade80" },
                }}
              />

              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: "1.9rem", md: "2.7rem" },
                  fontWeight: 900,
                  lineHeight: 1.2,
                }}
              >
                Our{" "}
                <Box component="span" sx={{ color: "#4ade80" }}>
                  Bus Types
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 1.2,
                  maxWidth: 700,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,.72)",
                }}
              >
                Choose the travel style that suits you. GreenBus offers
                Sleeper, AC, Non-AC, and Seater buses for different routes and
                passenger needs.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              onClick={goToBooking}
              sx={{
                flexShrink: 0,
                color: "#ffffff",
                borderColor: "rgba(255,255,255,.4)",
                px: 2.5,
                py: 1.1,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                "&:hover": {
                  borderColor: "#4ade80",
                  bgcolor: "rgba(34,197,94,.08)",
                },
              }}
            >
              Explore Available Trips →
            </Button>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: { xs: 2, md: 2.5 },
              alignItems: "stretch",
            }}
          >
            {busTypes.map((bus) => (
              <Card
                key={bus.name}
                elevation={0}
                sx={{
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "#10213d",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "transform .2s, border-color .2s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    borderColor: "#4ade80",
                  },
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    image={bus.image}
                    alt={`${bus.name} bus category`}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = busHero;
                    }}
                    sx={{
                      height: { xs: 205, md: 220 },
                      width: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  <Chip
                    label={bus.badge}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      color: "#052b1b",
                      bgcolor: "#4ade80",
                      fontWeight: 800,
                    }}
                  />
                </Box>

                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    p: { xs: 2.25, md: 2.75 },
                  }}
                >
                  <Typography
                    component="h3"
                    sx={{ fontSize: "1.35rem", fontWeight: 900 }}
                  >
                    {bus.name}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: "#4ade80",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {bus.subtitle}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1.3,
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,.72)",
                    }}
                  >
                    {bus.description}
                  </Typography>

                  <Divider
                    sx={{ my: 2, borderColor: "rgba(255,255,255,.13)" }}
                  />

                  <Typography sx={{ fontWeight: 800, mb: 1.25 }}>
                    Facilities & features
                  </Typography>

                  <Stack spacing={1} sx={{ mb: 2.5 }}>
                    {bus.facilities.map((facility) => (
                      <Box
                        key={facility}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            color: "#4ade80",
                            fontWeight: 900,
                            lineHeight: 1.5,
                          }}
                        >
                          ✓
                        </Box>
                        <Typography
                          sx={{
                            fontSize: 13.5,
                            lineHeight: 1.6,
                            color: "rgba(255,255,255,.82)",
                          }}
                        >
                          {facility}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Box sx={{ mt: "auto" }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={goToBooking}
                      endIcon={<ConfirmationNumberIcon />}
                      sx={{
                        py: 1.2,
                        borderRadius: 2,
                        bgcolor: "#4ade80",
                        color: "#052b1b",
                        fontWeight: 900,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#22c55e" },
                      }}
                    >
                      Book Your Ticket
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Typography
            sx={{
              mt: 3,
              textAlign: "center",
              color: "rgba(255,255,255,.58)",
              fontSize: 12,
              lineHeight: 1.7,
            }}
          >
            Facilities, seat arrangements and bus categories may vary by bus
            and route. Please check the selected trip details before booking.
          </Typography>
        </Container>
      </Box>

      {/* Everything for a smooth journey */}
      <Box
        component="section"
        sx={{ py: { xs: 5, md: 7 }, bgcolor: "#effaf3" }}
      >
        <Container maxWidth="xl">
          <Typography
            component="h2"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              fontSize: { xs: "1.65rem", md: "2.25rem" },
              color: "#0b1b35",
            }}
          >
            Everything You Need for a{" "}
            <Box component="span" sx={{ color: "#15803d" }}>
              Smooth Journey
            </Box>
          </Typography>

          <Typography
            sx={{ textAlign: "center", mt: 1, mb: 3.5, color: "#64748b" }}
          >
            From searching buses to managing tickets, GreenBus keeps the
            experience simple.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: { xs: 2, md: 2.5 },
              alignItems: "stretch",
            }}
          >
            {journeyFeatures.map((item) => (
              <Card
                key={item.number}
                elevation={0}
                sx={{
                  minWidth: 0,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid #dcece2",
                  bgcolor: "white",
                  transition: "transform .2s, box-shadow .2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 10px 24px rgba(15,23,42,.08)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={item.image}
                  alt={item.title}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = busHero;
                  }}
                  sx={{
                    height: 160,
                    width: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                <CardContent sx={{ p: 2.25, flexGrow: 1 }}>
                  <Typography
                    sx={{
                      color: "#15803d",
                      fontWeight: 900,
                      fontSize: 13,
                      mb: 0.75,
                    }}
                  >
                    {item.number}
                  </Typography>
                  <Typography
                    sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 14,
                      lineHeight: 1.65,
                      color: "#64748b",
                    }}
                  >
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* How it works */}
      <Box
        component="section"
        sx={{ py: { xs: 5, md: 6 }, bgcolor: "#ffffff" }}
      >
        <Container maxWidth="lg">
          <Typography
            component="h2"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              fontSize: { xs: "1.8rem", md: "2.25rem" },
              color: "#0b1b35",
            }}
          >
            How{" "}
            <Box component="span" sx={{ color: "#15803d" }}>
              It Works
            </Box>
          </Typography>

          <Typography
            sx={{ textAlign: "center", mt: 1, mb: 4, color: "#64748b" }}
          >
            Book your journey in four simple steps.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr)",
              },
              gap: { xs: 2.5, md: 3 },
              alignItems: "start",
            }}
          >
            {[
              {
                icon: <SearchIcon />,
                title: "1. Find a Bus",
                description: "Review available trips and route details.",
              },
              {
                icon: <EventSeatIcon />,
                title: "2. Choose a Seat",
                description: "Select from the available seats.",
              },
              {
                icon: <ConfirmationNumberIcon />,
                title: "3. Confirm Booking",
                description: "Complete the booking process.",
              },
              {
                icon: <ManageAccountsIcon />,
                title: "4. Access Your Ticket",
                description: "View your ticket and booking details.",
              },
            ].map((step) => (
              <Box
                key={step.title}
                sx={{
                  minWidth: 0,
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: "#15803d",
                    bgcolor: "#dcfce7",
                  }}
                >
                  {step.icon}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "#64748b",
                    }}
                  >
                    {step.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
