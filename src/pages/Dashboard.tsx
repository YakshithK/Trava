
import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/authContext";

// Mock data for upcoming trips
const mockTrips = [
  {
    id: 1,
    from: "Hyderabad",
    to: "Toronto",
    date: "2025-06-15",
    language: "Telugu"
  },
  {
    id: 2,
    from: "Mumbai",
    to: "New York",
    date: "2025-07-22",
    language: "Hindi"
  }
];

// Mock data for requests
const mockRequests = [
  {
    id: 1,
    name: "Anita Sharma",
    from: "Delhi",
    to: "London",
    date: "2025-06-10",
    status: "pending"
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  const [trips] = useState(mockTrips);
  const [requests] = useState(mockRequests);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
      <Card className="bg-gradient-to-br from-amber-50 to-green-50 border-amber-200">
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
                    <Badge>{trip.language}</Badge>
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
          <div className="grid gap-4 md:grid-cols-2">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <CardTitle>{request.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{request.from} to {request.to}</span>
                  </CardDescription>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(request.date)}</span>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between gap-2">
                  <Button variant="outline" className="w-full">Decline</Button>
                  <Button className="w-full">Accept</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
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
