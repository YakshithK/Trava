import { useUserStore } from "@/store/userStore";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/authContext";
import { useToast } from "@/hooks/use-toast";
import { Request } from "./types"; 
import { fetchRequests, fetchTrips, formatDate, deleteTrip } from "./functions";
import { FullRequests } from "./FullRequests";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trips, setTrips] = useState<any[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTrips(user, setLoading, setTrips);
      fetchRequests(setLoading, setRequests);
      console.log(requests)
    }
  }, [user]);

  const handleDeleteTrip = async (tripId: string) => {
    const success = await deleteTrip(tripId, toast);
    if (success && user) {
      // Refresh trips after successful deletion
      fetchTrips(user, setLoading, setTrips);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <p>Loading your trips...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your travel plans.
          </p>
        </div>
      </div>

      {/* Post Trip CTA */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Ready for your next journey?</h2>
              <p className="text-muted-foreground max-w-md">
                Share your travel plans and find companions for your upcoming trip.
              </p>
            </div>
            <Button asChild size="lg" className="w-full md:w-auto">
              <Link to="/trip-posting" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Post a New Trip</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Trips */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Upcoming Trips</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/trip-posting">Add Trip</Link>
          </Button>
        </div>

        {trips.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Card key={trip.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{trip.from} to {trip.to}</span>
                    <div className="flex items-center gap-2">
                      <Badge>{trip.language}</Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this trip to {trip.to}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteTrip(trip.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(trip.date)}</span>
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/matches?tripId=${trip.id}`}>
                      Find Companions
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">You don't have any upcoming trips.</p>
            <Button asChild>
              <Link to="/trip-posting">Post Your First Trip</Link>
            </Button>
          </Card>
        )}
      </div>

      {/* Incoming Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Incoming Requests</h2>
          {requests.length > 0 && (
            <Badge className="bg-amber-500">{requests.length} New</Badge>
          )}
        </div>

        {requests.length > 0 ? (
          <FullRequests requests={requests} />
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No incoming requests at the moment.
            </p>
          </Card>
        )}
      </div>

      {/* Recent Messages */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Messages</h2>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            You don't have any active conversations.
          </p>
          <Button asChild variant="outline">
            <Link to="/matches">Find Travel Companions</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
