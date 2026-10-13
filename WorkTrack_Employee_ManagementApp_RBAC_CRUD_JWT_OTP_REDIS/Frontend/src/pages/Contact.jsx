
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  EmailRounded,
  GitHub,
  LinkedIn,
  ArrowOutwardRounded,
  ContactSupportRounded,
} from "@mui/icons-material";

const Contact = () => {
  const contacts = [
    {
      title: "Email",
      value: "senanirban2000@gmail.com",
      description:
        "For project questions and professional enquiries.",
      icon: <EmailRounded />,
      action: "Send Email",
      href: "mailto:senanirban2000@gmail.com",
    },
    {
      title: "GitHub",
      value: "github.com/anirbansen-207",
      description:
        "Explore source code and development projects.",
      icon: <GitHub />,
      action: "View GitHub",
      href: "https://github.com/anirbansen-207",
    },
    {
      title: "LinkedIn",
      value: "linkedin.com/in/anirbansen123",
      description:
        "Connect for professional networking and opportunities.",
      icon: <LinkedIn />,
      action: "Connect on LinkedIn",
      href: "https://www.linkedin.com/in/anirbansen123/",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        color: "#ffffff",
        background:
          "radial-gradient(ellipse at 15% 10%, #1e416f 0%, #101d34 48%, #091222 100%)",
        overflowX: "clip",
      }}
    >
      {/* Contact page introduction */}
      <Container
        maxWidth="lg"
        sx={{
          pt: { xs: 6, md: 9 },
          pb: { xs: 5, md: 7 },
        }}
      >
        <Stack
          alignItems="center"
          textAlign="center"
          spacing={2.5}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.8,
              borderRadius: 20,
              border:
                "1px solid rgba(134,193,255,0.3)",
              backgroundColor:
                "rgba(134,193,255,0.08)",
              color: "#8dc4ff",
            }}
          >
            <ContactSupportRounded fontSize="small" />

            <Typography
              variant="overline"
              fontWeight={700}
              letterSpacing={1.5}
            >
              CONTACT
            </Typography>
          </Box>

          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: "2.7rem",
                sm: "3.5rem",
                md: "4.2rem",
              },
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "-0.035em",
            }}
          >
            Get in{" "}
            <Box
              component="span"
              sx={{ color: "#86c1ff" }}
            >
              Touch.
            </Box>
          </Typography>

          <Typography
            sx={{
              maxWidth: 680,
              color: "#c4d0e2",
              fontSize: { xs: 16, md: 18 },
              lineHeight: 1.9,
            }}
          >
            Have questions about WorkTrack or want to
            discuss the project? Feel free to reach out
            through any of the channels below.
          </Typography>
        </Stack>
      </Container>

      {/* Contact cards */}
      <Container
        maxWidth="lg"
        sx={{ pb: { xs: 6, md: 9 } }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 3,
          }}
        >
          {contacts.map((contact) => (
            <Paper
              key={contact.title}
              elevation={0}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                p: { xs: 3, sm: 3.5 },
                minWidth: 0,
                borderRadius: 3,
                color: "#ffffff",
                backgroundColor:
                  "rgba(255,255,255,0.055)",
                border:
                  "1px solid rgba(255,255,255,0.12)",
                transition:
                  "transform 180ms ease, border-color 180ms ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  borderColor:
                    "rgba(134,193,255,0.55)",
                },
              }}
            >
              {/* Contact icon */}
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2.5,
                  backgroundColor:
                    "rgba(105,177,255,0.14)",
                  color: "#86c1ff",
                  mb: 2.5,
                  "& .MuiSvgIcon-root": {
                    fontSize: 29,
                  },
                }}
              >
                {contact.icon}
              </Box>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ mb: 1 }}
              >
                {contact.title}
              </Typography>

              <Typography
                sx={{
                  color: "#86c1ff",
                  fontSize: 14,
                  fontWeight: 500,
                  overflowWrap: "anywhere",
                  mb: 1.5,
                }}
              >
                {contact.value}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#c4d0e2",
                  lineHeight: 1.8,
                  mb: 3,
                  flexGrow: 1,
                }}
              >
                {contact.description}
              </Typography>

              <Button
                component="a"
                href={contact.href}
                target={
                  contact.title === "Email"
                    ? undefined
                    : "_blank"
                }
                rel={
                  contact.title === "Email"
                    ? undefined
                    : "noopener noreferrer"
                }
                variant="outlined"
                endIcon={<ArrowOutwardRounded />}
                sx={{
                  mt: "auto",
                  color: "#ffffff",
                  borderColor:
                    "rgba(255,255,255,0.3)",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "#86c1ff",
                    backgroundColor:
                      "rgba(134,193,255,0.08)",
                  },
                }}
              >
                {contact.action}
              </Button>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* Project information */}
      <Box
        sx={{
          borderTop:
            "1px solid rgba(255,255,255,0.09)",
          backgroundColor:
            "rgba(0,0,0,0.12)",
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            py: { xs: 5, md: 7 },
            textAlign: "center",
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: "#86c1ff",
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            ABOUT THE PROJECT
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mt: 1.5,
              mb: 2,
              fontWeight: 800,
              fontSize: {
                xs: "1.7rem",
                sm: "2.2rem",
              },
            }}
          >
            WorkTrack
          </Typography>

          <Typography
            sx={{
              maxWidth: 700,
              mx: "auto",
              color: "#c4d0e2",
              lineHeight: 1.9,
            }}
          >
            WorkTrack is an employee and task management
            application that brings together team
            coordination, task tracking, attendance,
            leave management, and role-based access in
            one workspace.
          </Typography>

          <Button
            component="a"
            href="https://github.com/anirbansen-207"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<GitHub />}
            variant="contained"
            sx={{
              mt: 3,
              px: 3,
              py: 1.3,
              borderRadius: 2,
              backgroundColor: "#1976d2",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            Explore My GitHub
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Contact;