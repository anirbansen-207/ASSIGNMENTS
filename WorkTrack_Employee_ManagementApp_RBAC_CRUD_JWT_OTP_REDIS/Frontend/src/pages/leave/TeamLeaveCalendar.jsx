import {
  useQuery,
} from "@tanstack/react-query";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  getTeamLeaveCalendarApi,
} from "../../api/leaveApi";

function TeamLeaveCalendar() {
  const {
    data: leaves = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "team-leave-calendar",
    ],
    queryFn:
      getTeamLeaveCalendarApi,
  });

  const formatDate = (
    date,
  ) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date,
    ).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "center",
          mt: 5,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error?.response?.data
          ?.message ||
          error?.message ||
          "Failed to load team leave calendar"}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        fontWeight={700}
      >
        Team Leave Calendar
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mb: 3,
        }}
      >
        Approved leave records for
        your team.
      </Typography>

      {leaves.length ===
      0 ? (
        <Alert severity="info">
          No approved team leaves
          found.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {leaves.map(
            (leave) => (
              <Card
                key={
                  leave._id
                }
                variant="outlined"
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                  >
                    {
                      leave
                        .employeeId
                        ?.name
                    }
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {
                      leave
                        .employeeId
                        ?.designation
                    }
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                    }}
                  >
                    {
                      leave.leaveType
                    }
                  </Typography>

                  <Typography
                    variant="body2"
                  >
                    {
                      formatDate(
                        leave.startDate,
                      )
                    }{" "}
                    →{" "}
                    {
                      formatDate(
                        leave.endDate,
                      )
                    }
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                    }}
                  >
                    Reason:{" "}
                    {
                      leave.reason
                    }
                  </Typography>
                </CardContent>
              </Card>
            ),
          )}
        </Stack>
      )}
    </Box>
  );
}

export default TeamLeaveCalendar;