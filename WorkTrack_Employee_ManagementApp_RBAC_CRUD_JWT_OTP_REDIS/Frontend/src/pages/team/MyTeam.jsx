
import { useQuery } from "@tanstack/react-query";

import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import WorkIcon from "@mui/icons-material/Work";

import {
  getMyTeamApi,
  getMyTeamMembersApi,
} from "../../api/teamApi";

// Consistent blue color palette for the employee pages.
const primaryBlue = "#1976d2";
const lightBlue = "#eaf3ff";
const borderColor = "#e5eaf1";

// Reusable information item for the team summary card.
const TeamInfoItem = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
      sx={{
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          minWidth: 38,
          borderRadius: "10px",
          bgcolor: "#ffffff",
          border: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: primaryBlue,
        }}
      >
        <Icon fontSize="small" />
      </Box>

      <Box
        sx={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 0.4,
            fontSize: "0.8rem",
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="body1"
          fontWeight={600}
          sx={{
            overflowWrap: "anywhere",
            fontSize: "0.92rem",
          }}
        >
          {value || "N/A"}
        </Typography>
      </Box>
    </Stack>
  );
};

// Generate initials without requiring any additional API fields.
const getInitials = (name) => {
  if (!name || typeof name !== "string") {
    return "TM";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const MyTeam = () => {
  // Fetch the current employee's team.
  const {
    data: team,
    isLoading: teamLoading,
    error: teamError,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: ["myTeam"],
    queryFn: getMyTeamApi,
  });

  // Fetch the members of the current employee's team.
  const {
    data: members = [],
    isLoading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ["myTeamMembers"],
    queryFn: getMyTeamMembersApi,
  });

  const loading = teamLoading || membersLoading;
  const error = teamError || membersError;

  // Handle loading without showing an incomplete page.
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          bgcolor: "#ffffff",
        }}
      >
        <CircularProgress
          size={34}
          thickness={4}
          sx={{
            color: primaryBlue,
          }}
        />

        <Typography
          color="text.secondary"
          variant="body2"
        >
          Loading your team...
        </Typography>
      </Box>
    );
  }

  // Display API errors and allow the employee to retry.
  if (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong while loading your team.";

    return (
      <Box
        sx={{
          bgcolor: "#ffffff",
          minHeight: 250,
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 3,
            fontSize: {
              xs: "1.6rem",
              sm: "2rem",
            },
          }}
        >
          My Team
        </Typography>

        <Alert
          severity="error"
          action={
            <Stack
              direction="row"
              spacing={1}
            >
              <Chip
                label="Retry"
                clickable
                color="error"
                variant="outlined"
                onClick={() => {
                  refetchTeam();
                  refetchMembers();
                }}
              />
            </Stack>
          }
        >
          {errorMessage}
        </Alert>
      </Box>
    );
  }

  // Support an API response containing no assigned team.
  const hasTeam =
    team && typeof team === "object";

  // Safely handle an unexpected non-array members response.
  const teamMembers = Array.isArray(members)
    ? members
    : [];

  // Existing backend fields are preserved.
  const departmentName =
    team?.departmentId?.name || "N/A";

  const managerName =
    team?.managerId?.name || "N/A";

  const managerEmail =
    team?.managerId?.email || "N/A";

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        bgcolor: "#ffffff",
        pb: 3,
      }}
    >
      {/* Page heading */}
      <Box
        sx={{
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: "#172b4d",
            fontSize: {
              xs: "1.6rem",
              sm: "2rem",
            },
            letterSpacing: "-0.5px",
          }}
        >
          My Team
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.75,
          }}
        >
          View your team information and colleagues.
        </Typography>
      </Box>

      {/* Team summary */}
      {hasTeam ? (
        <Card
          elevation={0}
          sx={{
            mb: 4,
            border: `1px solid ${borderColor}`,
            borderRadius: "12px",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #edf5ff 0%, #f8fbff 100%)",
          }}
        >
          {/* Blue-tinted team header */}
          <Box
            sx={{
              p: {
                xs: 2.5,
                sm: 3,
              },
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
            >
              <Avatar
                variant="rounded"
                sx={{
                  width: 54,
                  height: 54,
                  bgcolor: primaryBlue,
                  borderRadius: "12px",
                }}
              >
                <GroupsIcon
                  sx={{
                    fontSize: 30,
                  }}
                />
              </Avatar>

              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{
                    color: "#172b4d",
                    fontSize: {
                      xs: "1.25rem",
                      sm: "1.5rem",
                    },
                    overflowWrap: "anywhere",
                  }}
                >
                  {team.name || "My Team"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.75,
                    lineHeight: 1.7,
                    overflowWrap: "anywhere",
                  }}
                >
                  {team.description ||
                    "No description available for this team."}
                </Typography>
              </Box>

              <Chip
                icon={<GroupsIcon />}
                label="My Team"
                sx={{
                  bgcolor: "#ffffff",
                  color: primaryBlue,
                  fontWeight: 600,
                  border: "1px solid #d6e6ff",
                  "& .MuiChip-icon": {
                    color: primaryBlue,
                  },
                }}
              />
            </Stack>
          </Box>

          <Divider
            sx={{
              borderColor: "#dce8f7",
            }}
          />

          {/* Team information grid */}
          <CardContent
            sx={{
              p: {
                xs: 2.5,
                sm: 3,
              },
              "&:last-child": {
                pb: {
                  xs: 2.5,
                  sm: 3,
                },
              },
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{
                mb: 2.5,
                color: "#172b4d",
              }}
            >
              Team Information
            </Typography>

            <Grid
              container
              spacing={{
                xs: 2.5,
                sm: 3,
              }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
              >
                <TeamInfoItem
                  icon={BusinessIcon}
                  label="Department"
                  value={departmentName}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
              >
                <TeamInfoItem
                  icon={PersonIcon}
                  label="Team Manager"
                  value={managerName}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
              >
                <TeamInfoItem
                  icon={EmailIcon}
                  label="Manager Email"
                  value={managerEmail}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
              >
                <TeamInfoItem
                  icon={AccessTimeIcon}
                  label="Check-in Time"
                  value={team.checkInTime}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
              >
                <TeamInfoItem
                  icon={DescriptionIcon}
                  label="Team Description"
                  value={team.description || "No description"}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Card
          elevation={0}
          sx={{
            mb: 4,
            border: `1px solid ${borderColor}`,
            borderRadius: "12px",
          }}
        >
          <CardContent
            sx={{
              py: 5,
              px: 2,
              textAlign: "center",
            }}
          >
            <Avatar
              sx={{
                width: 58,
                height: 58,
                mx: "auto",
                mb: 2,
                bgcolor: lightBlue,
                color: primaryBlue,
              }}
            >
              <GroupsIcon fontSize="large" />
            </Avatar>

            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mb: 1,
                color: "#172b4d",
              }}
            >
              No Team Assigned
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              You have not been assigned to a team yet.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Team members heading */}
      <Box
        sx={{
          mb: 2.5,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "10px",
              bgcolor: lightBlue,
              color: primaryBlue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GroupsIcon />
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                color: "#172b4d",
                fontSize: {
                  xs: "1.2rem",
                  sm: "1.4rem",
                },
              }}
            >
              Team Members
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.4,
              }}
            >
              People working in your team
            </Typography>
          </Box>

          <Chip
            label={teamMembers.length}
            size="small"
            sx={{
              bgcolor: lightBlue,
              color: primaryBlue,
              fontWeight: 700,
              minWidth: 34,
            }}
          />
        </Stack>
      </Box>

      {/* Team member cards */}
      {teamMembers.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${borderColor}`,
            borderRadius: "12px",
          }}
        >
          <CardContent
            sx={{
              py: 5,
              px: 2,
              textAlign: "center",
            }}
          >
            <Avatar
              sx={{
                width: 54,
                height: 54,
                mx: "auto",
                mb: 2,
                bgcolor: "#f1f5f9",
                color: "#64748b",
              }}
            >
              <PersonIcon fontSize="large" />
            </Avatar>

            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                mb: 1,
              }}
            >
              No Team Members Found
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              There are currently no team members to display.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid
          container
          spacing={2}
        >
          {teamMembers.map((member) => {
            const memberDepartment =
              member.department ||
              member.departmentId?.name ||
              "N/A";

            return (
              <Grid
                key={member._id}
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "12px",
                    transition:
                      "border-color 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      borderColor: "#b7d4ff",
                      boxShadow:
                        "0 4px 16px rgba(25, 118, 210, 0.08)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2.5,
                      "&:last-child": {
                        pb: 2.5,
                      },
                    }}
                  >
                    {/* Member identity */}
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{
                        mb: 2.5,
                        minWidth: 0,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: lightBlue,
                          color: primaryBlue,
                          fontWeight: 700,
                          fontSize: "1rem",
                        }}
                      >
                        {getInitials(member.name)}
                      </Avatar>

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{
                            fontSize: "1rem",
                            color: "#172b4d",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {member.name || "Unnamed Employee"}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {member.email || "No email available"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider
                      sx={{
                        mb: 2,
                        borderColor,
                      }}
                    />

                    {/* Member employment information */}
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                      >
                        <WorkIcon
                          fontSize="small"
                          sx={{
                            mt: 0.2,
                            color: primaryBlue,
                          }}
                        />

                        <Box
                          sx={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Designation
                          </Typography>

                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              mt: 0.3,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {member.designation || "N/A"}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                      >
                        <BusinessIcon
                          fontSize="small"
                          sx={{
                            mt: 0.2,
                            color: primaryBlue,
                          }}
                        />

                        <Box
                          sx={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Department
                          </Typography>

                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              mt: 0.3,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {memberDepartment}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default MyTeam;
