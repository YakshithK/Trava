
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for incoming requests
const incomingRequests = [
  {
    id: 1,
    name: "Anita Sharma",
    age: 65,
    from: "Delhi",
    to: "London",
    date: "2025-06-10",
    language: "Hindi",
    photoUrl: ""
  },
  {
    id: 2,
    name: "Mohan Kumar",
    age: 70,
    from: "Chennai",
    to: "Sydney",
    date: "2025-07-22",
    language: "Tamil",
    photoUrl: ""
  }
];

// Mock data for outgoing requests
const outgoingRequests = [
  {
    id: 3,
    name: "Rajesh Patel",
    age: 68,
    from: "Hyderabad",
    to: "Toronto",
    date: "2025-06-15",
    language: "Telugu",
    status: "pending",
    photoUrl: ""
  },
  {
    id: 4,
    name: "Priya Singh",
    age: 72,
    from: "Mumbai",
    to: "New York",
    date: "2025-08-05",
    language: "Hindi",
    status: "accepted",
    photoUrl: ""
  },
  {
    id: 5,
    name: "Venkat Rao",
    age: 67,
    from: "Bangalore",
    to: "Berlin",
    date: "2025-09-12",
    language: "Kannada",
    status: "rejected",
    photoUrl: ""
  }
];

const Requests = () => {
  const [incoming] = useState(incomingRequests);
  const [outgoing] = useState(outgoingRequests);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500";
      case "accepted": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Travel Requests</h1>
        <p className="text-muted-foreground">
          Manage your incoming and outgoing travel companion requests.
        </p>
      </div>

      <Tabs defaultValue="incoming">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incoming">
            Incoming Requests 
            {incoming.length > 0 && (
              <Badge className="ml-2 bg-amber-500">{incoming.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            Outgoing Requests
            {outgoing.length > 0 && (
              <Badge className="ml-2">{outgoing.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming" className="mt-6">
          {incoming.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {incoming.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.photoUrl} />
                      <AvatarFallback>{getInitials(request.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{request.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{request.age} • {request.language}</span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{request.from} to {request.to}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(request.date)}</span>
                    </div>
                  </CardContent>
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
                You don't have any incoming travel requests.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="mt-6">
          {outgoing.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {outgoing.map((request) => (
                <Card key={request.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.photoUrl} />
                      <AvatarFallback>{getInitials(request.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle>{request.name}</CardTitle>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{request.age} • {request.language}</span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{request.from} to {request.to}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(request.date)}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {request.status === "accepted" ? (
                      <Button asChild className="w-full">
                        <a href={`/chat/${request.id}`}>Start Chat</a>
                      </Button>
                    ) : request.status === "pending" ? (
                      <Button variant="outline" className="w-full">Cancel Request</Button>
                    ) : (
                      <Button variant="outline" className="w-full">Remove</Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                You haven't sent any travel requests yet.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Requests;
