import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { toast } from "sonner";
import { getAllRoutes, deleteRoute } from "../../services/routeService";

const Routes = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: routes,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["routes"],
    queryFn: getAllRoutes,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoute,
    onSuccess: () => {
      toast.success("Route deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete route",
      );
    },
  });

  if (isLoading) {
    return <Typography>Loading routes...</Typography>;
  }

  if (isError) {
    return (
      <Typography color="error">
        Failed to load routes: {error.message}
      </Typography>
    );
  }

  const handleDelete = (route) => {
    const routeName = `${route.sourceCity} → ${route.destinationCity}`;
    if (
      window.confirm(
        `Delete route ${routeName}? Routes used by scheduled or ongoing trips cannot be deleted. Completed and cancelled trips will not block deletion.`,
      )
    ) {
      deleteMutation.mutate(route._id);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Route Management
      </Typography>

      <Button
        variant="contained"
        sx={{ mb: 3 }}
        onClick={() => navigate("/super-admin/routes/add")}
      >
        Add Route
      </Button>

      {routes?.length === 0 ? (
        <Typography>No routes found.</Typography>
      ) : (
        routes?.map((route) => (
          <Card key={route._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">
                {route.sourceCity} → {route.destinationCity}
              </Typography>

              <Typography sx={{ mt: 1 }}>
                <strong>Distance:</strong> {route.routeDistance} km
              </Typography>

              <Typography>
                <strong>Status:</strong> {route.routeStatus}
              </Typography>

              <Button
                variant="outlined"
                sx={{ mt: 2, mr: 2 }}
                onClick={() =>
                  navigate(`/super-admin/routes/edit/${route._id}`)
                }
              >
                Edit
              </Button>

              <Button
                variant="contained"
                color="error"
                sx={{ mt: 2 }}
                onClick={() => handleDelete(route)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default Routes;
