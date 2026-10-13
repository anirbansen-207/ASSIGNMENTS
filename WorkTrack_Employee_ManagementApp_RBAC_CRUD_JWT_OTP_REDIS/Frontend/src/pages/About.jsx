
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowForwardRounded,
  GroupsRounded,
  TaskAltRounded,
  AccessTimeRounded,
  EventAvailableRounded,
  NotificationsActiveRounded,
  AdminPanelSettingsRounded,
  PersonRounded,
  WorkspacesRounded,
  InsightsRounded,
} from "@mui/icons-material";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <GroupsRounded />,
      title: "Employee Management",
      description:
        "Manage employee information, designations, departments, and profiles from one organized workspace.",
    },
    {
      icon: <WorkspacesRounded />,
      title: "Team Management",
      description:
        "Create teams, assign managers, organize team members, and manage team responsibilities.",
    },
    {
      icon: <TaskAltRounded />,
      title: "Task Management",
      description:
        "Assign tasks, track progress, update statuses, and support task review between employees and managers.",
    },
    {
      icon: <AccessTimeRounded />,
      title: "Attendance Tracking",
      description:
        "Record check-in and check-out times and review attendance information.",
    },
    {
      icon: <EventAvailableRounded />,
      title: "Leave Management",
      description:
        "Submit leave requests, review decisions, and keep track of leave information.",
    },
    {
      icon: <NotificationsActiveRounded />,
      title: "Notifications",
      description:
        "Keep users informed about relevant activities and updates within the application.",
    },
  ];

  const roles = [
    {
      icon: <AdminPanelSettingsRounded />,
      title: "Admin",
      description:
        "Oversees users, managers, departments, teams, tasks, attendance, and organizational activities.",
    },
    {
      icon: <GroupsRounded />,
      title: "Manager",
      description:
        "Manages employees and teams, assigns tasks, reviews work, and handles team-related responsibilities.",
    },
    {
      icon: <PersonRounded />,
      title: "Employee",
      description:
        "Views assigned tasks, updates work progress, manages profile information, and accesses attendance and leave features.",
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
      {/* About page introduction */}
      <Container
        maxWidth="lg"
        sx={{
          pt: { xs: 6, md: 9 },
          pb: { xs: 5, md: 7 },
        }}
      >
        <Stack
          spacing={2.5}
          alignItems="center"
          textAlign="center"
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
            <WorkspacesRounded fontSize="small" />

            <Typography
              variant="overline"
              fontWeight={700}
              letterSpacing={1.5}
            >
              ABOUT WORKTRACK
            </Typography>
          </Box>

          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: "2.5rem",
                sm: "3.5rem",
                md: "4.2rem",
              },
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "-0.035em",
              maxWidth: 850,
            }}
          >
            Bringing people and work
            <Box
              component="span"
              sx={{
                display: "block",
                color: "#86c1ff",
              }}
            >
              together in one place.
            </Box>
          </Typography>

          <Typography
            sx={{
              maxWidth: 780,
              color: "#c4d0e2",
              fontSize: {
                xs: 16,
                md: 18,
              },
              lineHeight: 1.9,
            }}
          >
            WorkTrack is an employee and task management
            application designed to organize workplace
            activities, simplify team coordination, and
            help users track work progress through a
            centralized platform.
          </Typography>
        </Stack>
      </Container>

      {/* Project purpose */}
      <Container
        maxWidth="lg"
        sx={{ pb: { xs: 6, md: 9 } }}
      >
        <Paper
          elevation={0}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.1fr 0.9fr",
            },
            gap: 4,
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 4,
            backgroundColor:
              "rgba(255,255,255,0.055)",
            border:
              "1px solid rgba(255,255,255,0.12)",
            color: "white",
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: "#86c1ff",
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              OUR PURPOSE
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                mb: 2,
                fontWeight: 700,
              }}
            >
              A more organized way to work
            </Typography>

            <Typography
              sx={{
                color: "#c4d0e2",
                lineHeight: 1.9,
              }}
            >
              Managing employees, assignments, attendance,
              and leave through disconnected processes can
              make coordination difficult. WorkTrack brings
              these activities into one application with
              role-based access for administrators, managers,
              and employees.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 2,
              alignContent: "center",
            }}
          >
            {[
              {
                icon: <GroupsRounded />,
                title: "Organized teams",
                subtitle: "People and responsibilities",
              },
              {
                icon: <TaskAltRounded />,
                title: "Clear progress",
                subtitle: "Task status and reviews",
              },
              {
                icon: <AccessTimeRounded />,
                title: "Attendance",
                subtitle: "Work-time records",
              },
              {
                icon: <InsightsRounded />,
                title: "Visibility",
                subtitle: "Information for each role",
              },
            ].map((item) => (
              <Box
                key={item.title}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  backgroundColor:
                    "rgba(255,255,255,0.045)",
                  border:
                    "1px solid rgba(255,255,255,0.09)",
                }}
              >
                <Box
                  sx={{
                    color: "#86c1ff",
                    display: "flex",
                    mb: 1.2,
                  }}
                >
                  {item.icon}
                </Box>

                <Typography fontWeight={700}>
                  {item.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    color: "#aebfd5",
                    lineHeight: 1.6,
                  }}
                >
                  {item.subtitle}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Container>

      {/* Application features */}
      <Container
        maxWidth="lg"
        sx={{ pb: { xs: 6, md: 9 } }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="overline"
            sx={{
              color: "#86c1ff",
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            WHAT WORKTRACK OFFERS
          </Typography>

          <Typography
            variant="h3"
            sx={{
              mt: 1,
              fontSize: {
                xs: "2rem",
                md: "2.7rem",
              },
              fontWeight: 800,
            }}
          >
            Everything in one workspace
          </Typography>

          <Typography
            sx={{
              mt: 1.5,
              maxWidth: 700,
              color: "#c4d0e2",
              lineHeight: 1.8,
            }}
          >
            The application brings together essential
            employee and workplace management functions.
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {features.map((feature) => (
            <Grid
              key={feature.title}
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  minHeight: 215,
                  p: 3,
                  borderRadius: 3,
                  color: "white",
                  backgroundColor:
                    "rgba(255,255,255,0.055)",
                  border:
                    "1px solid rgba(255,255,255,0.12)",
                  transition:
                    "transform 180ms ease, border-color 180ms ease, background-color 180ms ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor:
                      "rgba(134,193,255,0.55)",
                    backgroundColor:
                      "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2.5,
                    backgroundColor:
                      "rgba(105,177,255,0.14)",
                    color: "#86c1ff",
                    mb: 2.5,
                    "& .MuiSvgIcon-root": {
                      fontSize: 27,
                    },
                  }}
                >
                  {feature.icon}
                </Box>

                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ mb: 1 }}
                >
                  {feature.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#c4d0e2",
                    lineHeight: 1.8,
                  }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Role-based access section */}
      <Box
        sx={{
          backgroundColor:
            "rgba(0,0,0,0.13)",
          borderTop:
            "1px solid rgba(255,255,255,0.08)",
          borderBottom:
            "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            py: { xs: 6, md: 8 },
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="overline"
              sx={{
                color: "#86c1ff",
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              BUILT FOR DIFFERENT ROLES
            </Typography>

            <Typography
              variant="h3"
              sx={{
                mt: 1,
                fontSize: {
                  xs: "2rem",
                  md: "2.7rem",
                },
                fontWeight: 800,
              }}
            >
              Everyone has a place
            </Typography>

            <Typography
              sx={{
                mt: 1.5,
                color: "#c4d0e2",
                lineHeight: 1.8,
                maxWidth: 700,
              }}
            >
              Role-based access helps users focus on the
              responsibilities relevant to their work.
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {roles.map((role) => (
              <Grid
                key={role.title}
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    p: 3,
                    borderRadius: 3,
                    color: "white",
                    backgroundColor:
                      "rgba(255,255,255,0.055)",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <Box
                    sx={{
                      color: "#86c1ff",
                      display: "flex",
                      mb: 2,
                      "& .MuiSvgIcon-root": {
                        fontSize: 32,
                      },
                    }}
                  >
                    {role.icon}
                  </Box>

                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{ mb: 1.5 }}
                  >
                    {role.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#c4d0e2",
                      lineHeight: 1.8,
                    }}
                  >
                    {role.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Closing call to action */}
      <Container
        maxWidth="md"
        sx={{
          py: { xs: 6, md: 8 },
          textAlign: "center",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: {
              xs: "2rem",
              md: "2.8rem",
            },
            fontWeight: 800,
          }}
        >
          Ready to get started?
        </Typography>

        <Typography
          sx={{
            mt: 2,
            mb: 3,
            color: "#c4d0e2",
            lineHeight: 1.8,
          }}
        >
          Sign in to WorkTrack to access your workspace
          and the features available for your role.
        </Typography>

        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardRounded />}
          onClick={() => navigate("/login")}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            backgroundColor: "#1976d2",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          Login to WorkTrack
        </Button>
      </Container>
    </Box>
  );
};

export default About;