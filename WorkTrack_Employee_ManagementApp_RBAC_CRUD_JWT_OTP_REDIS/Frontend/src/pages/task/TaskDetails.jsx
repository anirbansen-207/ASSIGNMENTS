import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useState,
} from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";

import {
  getSingleTaskApi,
} from "../../api/taskApi";

import {
  addTaskCommentApi,
  getTaskCommentsApi,
} from "../../api/taskCommentApi";

import {
  getTaskActivitiesApi,
} from "../../api/taskActivityApi";

import {
  useParams,
} from "react-router-dom";

const TaskDetails =
  () => {
    const {
      taskId,
    } = useParams();

    const queryClient =
      useQueryClient();

    const [comment, setComment] =
      useState("");

    // Fetch the selected task.
    const {
      data: task,
      isLoading:
        taskLoading,
      error:
        taskError,
    } = useQuery({
      queryKey: [
        "task",
        taskId,
      ],
      queryFn: () =>
        getSingleTaskApi(
          taskId,
        ),
      enabled:
        !!taskId,
    });

    // Fetch comments belonging to this task.
    const {
      data: comments = [],
      isLoading:
        commentsLoading,
      error:
        commentsError,
    } = useQuery({
      queryKey: [
        "taskComments",
        taskId,
      ],
      queryFn: () =>
        getTaskCommentsApi(
          taskId,
        ),
      enabled:
        !!taskId,
    });

    // Fetch task activity history.
    const {
      data: activities = [],
      isLoading:
        activitiesLoading,
      error:
        activitiesError,
    } = useQuery({
      queryKey: [
        "taskActivities",
        taskId,
      ],
      queryFn: () =>
        getTaskActivitiesApi(
          taskId,
        ),
      enabled:
        !!taskId,
    });

    // Add a comment using the backend comment endpoint.
    const {
      mutate: addComment,
      isPending:
        isAddingComment,
      error:
        addCommentError,
    } = useMutation({
      mutationFn: () =>
        addTaskCommentApi(
          taskId,
          comment.trim(),
        ),

      onSuccess: () => {
        // Refresh the comment list after adding
        // a new comment.
        queryClient.invalidateQueries(
          {
            queryKey: [
              "taskComments",
              taskId,
            ],
          },
        );

        // Clear the input after successful submission.
        setComment("");
      },
    });

    const handleCommentSubmit =
      (event) => {
        event.preventDefault();

        // Do not send an empty comment.
        if (!comment.trim()) {
          return;
        }

        addComment();
      };

    if (taskLoading) {
      return (
        <Typography>
          Loading task...
        </Typography>
      );
    }

    if (taskError) {
      return (
        <Typography
          color="error"
        >
          {taskError.response
            ?.data?.message ||
            taskError.message}
        </Typography>
      );
    }

    return (
      <Box>
        {/* Task heading */}
        <Typography
          variant="h4"
          fontWeight={600}
          sx={{
            mb: 3,
          }}
        >
          Task Details
        </Typography>

        {/* Main task information */}
        <Card
          sx={{
            mb: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              fontWeight={600}
            >
              {task.title}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
              }}
            >
              {task.description ||
                "No description"}
            </Typography>

            <Divider
              sx={{
                my: 2,
              }}
            />

            <Typography>
              <strong>Status:</strong>{" "}
              {task.status}
            </Typography>

            <Typography
              sx={{
                mt: 1,
              }}
            >
              <strong>Priority:</strong>{" "}
              {task.priority}
            </Typography>

            <Typography
              sx={{
                mt: 1,
              }}
            >
              <strong>Team:</strong>{" "}
              {task.teamId?.name ||
                "N/A"}
            </Typography>

            <Typography
              sx={{
                mt: 1,
              }}
            >
              <strong>Assigned To:</strong>{" "}
              {task.assignedTo?.name ||
                "N/A"}
            </Typography>

            <Typography
              sx={{
                mt: 1,
              }}
            >
              <strong>Assigned By:</strong>{" "}
              {task.assignedBy?.name ||
                "N/A"}
            </Typography>

            <Typography
              sx={{
                mt: 1,
              }}
            >
              <strong>Department:</strong>{" "}
              {task.departmentId?.name ||
                "N/A"}
            </Typography>

            <Typography
              sx={{
                mt: 1,
              }}
            >
              <strong>Estimated Hours:</strong>{" "}
              {task.estimatedHours}
            </Typography>

            <Typography
              sx={{
                mt: 1,
              }}
            >
              <strong>Actual Hours:</strong>{" "}
              {task.actualHours}
            </Typography>

            <Typography
              sx={{
                mt: 2,
                mb: 1,
              }}
            >
              <strong>
                Progress:
              </strong>{" "}
              {task.progress}%
            </Typography>

            <LinearProgress
              variant="determinate"
              value={
                task.progress || 0
              }
            />

            <Typography
              sx={{
                mt: 2,
              }}
            >
              <strong>Start Date:</strong>{" "}
              {task.startDate
                ? new Date(
                    task.startDate,
                  ).toLocaleString()
                : "N/A"}
            </Typography>

            <Typography
              sx={{
                mt: 1,
              }}
            >
              <strong>Due Date:</strong>{" "}
              {task.dueDate
                ? new Date(
                    task.dueDate,
                  ).toLocaleString()
                : "N/A"}
            </Typography>

            {task.completedAt && (
              <Typography
                sx={{
                  mt: 1,
                }}
              >
                <strong>
                  Completed At:
                </strong>{" "}
                {new Date(
                  task.completedAt,
                ).toLocaleString()}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Comments section */}
        <Card
          sx={{
            mb: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                mb: 2,
              }}
            >
              Comments
            </Typography>

            {/* Add comment form */}
            <Box
              component="form"
              onSubmit={
                handleCommentSubmit
              }
            >
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Write a comment"
                value={comment}
                onChange={(
                  event,
                ) =>
                  setComment(
                    event.target
                      .value,
                  )
                }
                inputProps={{
                  maxLength: 1000,
                }}
              />

              <Button
                type="submit"
                variant="contained"
                sx={{
                  mt: 1,
                }}
                disabled={
                  !comment.trim() ||
                  isAddingComment
                }
              >
                {isAddingComment
                  ? "Adding..."
                  : "Add Comment"}
              </Button>
            </Box>

            {addCommentError && (
              <Typography
                color="error"
                sx={{
                  mt: 1,
                }}
              >
                {addCommentError
                  .response
                  ?.data?.message ||
                  addCommentError.message}
              </Typography>
            )}

            <Divider
              sx={{
                my: 3,
              }}
            />

            {commentsLoading ? (
              <Typography>
                Loading comments...
              </Typography>
            ) : commentsError ? (
              <Typography
                color="error"
              >
                {commentsError.response
                  ?.data?.message ||
                  commentsError.message}
              </Typography>
            ) : comments.length ===
              0 ? (
              <Typography
                color="text.secondary"
              >
                No comments yet.
              </Typography>
            ) : (
              comments.map(
                (item) => (
                  <Box
                    key={
                      item._id
                    }
                    sx={{
                      mb: 2,
                    }}
                  >
                    <Typography
                      fontWeight={600}
                    >
                      {item.userId
                        ?.name ||
                        "Unknown User"}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {item.userId
                        ?.role ||
                        ""}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      {item.comment}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {item.createdAt
                        ? new Date(
                            item.createdAt,
                          ).toLocaleString()
                        : ""}
                    </Typography>

                    <Divider
                      sx={{
                        mt: 2,
                      }}
                    />
                  </Box>
                ),
              )
            )}
          </CardContent>
        </Card>

        {/* Task activity section */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                mb: 2,
              }}
            >
              Task Activity
            </Typography>

            {activitiesLoading ? (
              <Typography>
                Loading activity...
              </Typography>
            ) : activitiesError ? (
              <Typography
                color="error"
              >
                {activitiesError.response
                  ?.data?.message ||
                  activitiesError.message}
              </Typography>
            ) : activities.length ===
              0 ? (
              <Typography
                color="text.secondary"
              >
                No activity recorded
                for this task.
              </Typography>
            ) : (
              activities.map(
                (activity) => (
                  <Box
                    key={
                      activity._id
                    }
                    sx={{
                      mb: 2,
                    }}
                  >
                    <Typography
                      fontWeight={600}
                    >
                      {
                        activity.action
                      }
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      {
                        activity.description
                      }
                    </Typography>

                    {activity.oldValue !==
                      null && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                        }}
                      >
                        Old:{" "}
                        {
                          activity.oldValue
                        }
                      </Typography>
                    )}

                    {activity.newValue !==
                      null && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        New:{" "}
                        {
                          activity.newValue
                        }
                      </Typography>
                    )}

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      By{" "}
                      {activity
                        .userId
                        ?.name ||
                        "Unknown User"}
                      {" • "}
                      {activity.createdAt
                        ? new Date(
                            activity.createdAt,
                          ).toLocaleString()
                        : ""}
                    </Typography>

                    <Divider
                      sx={{
                        mt: 2,
                      }}
                    />
                  </Box>
                ),
              )
            )}
          </CardContent>
        </Card>
      </Box>
    );
  };

export default TaskDetails;