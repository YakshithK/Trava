import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/config/supabase";

type Request = {
  from_user: string;
  to_user: string;
  id: number;
  name: string;
  age: number;
  from: string;  
  to: string;
  date: string;
  photoUrl: string;
  status?: string; 
};  

const Requests = () => {
  const [incoming, setIncoming] = useState<Request[]>([]);
  const [outgoing, setOutgoing] = useState<Request[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch incoming requests: matches where current user is to_user
        const { data: incomingMatches, error: incomingError } = await supabase
          .from("matches")
          .select("id, from_user, to_user, trip_id, status")
          .eq("to_user", user.id)
          .eq("status", "pending");

        if (incomingError) throw incomingError;

        // Fetch outgoing requests: matches where current user is from_user
        const { data: outgoingMatches, error: outgoingError } = await supabase
          .from("matches")
          .select("id, to_user, trip_id, status")
          .eq("from_user", user.id)
          .eq("status", "pending");

        if (outgoingError) throw outgoingError;

        // Helper to fetch enriched request data
        const enrichRequests = async (
          matches: any[],
          isIncoming: boolean
        ): Promise<Request[]> => {
          if (!matches || matches.length === 0) return [];

          // Collect user IDs for profiles:
          // For incoming requests, other user is from_user
          // For outgoing requests, other user is to_user
          const otherUserIds = matches.map((m) =>
            isIncoming ? m.from_user : m.to_user
          );

          // Fetch user profiles
          const { data: profiles, error: profileError } = await supabase
            .from("users")
            .select("id, name, age, photo")
            .in("id", otherUserIds);

          if (profileError) throw profileError;

          // Fetch trips for these requests
          const tripIds = matches.map((m) => m.trip_id);
          const { data: trips, error: tripsError } = await supabase
            .from("trips")
            .select("id, from, to, date")
            .in("id", tripIds);

          if (tripsError) throw tripsError;

          // Map enriched data
          return matches.map((m) => {
            const otherUserId = isIncoming ? m.from_user : m.to_user;
            const profile = profiles.find((p) => p.id === otherUserId);
            const trip = trips.find((t) => t.id === m.trip_id);

            return {
              id: m.id,
              from_user: m.from_user,
              to_user: m.to_user,
              name: profile?.name || "Unknown",
              age: profile?.age || 0,
              photoUrl: profile?.photo || "",
              from: trip?.from || "",
              to: trip?.to || "",
              date: trip?.date || "",
              status: m.status,
            };
          });
        };

        const enrichedIncoming = await enrichRequests(incomingMatches, true);
        const enrichedOutgoing = await enrichRequests(outgoingMatches, false);

        setIncoming(enrichedIncoming);
        setOutgoing(enrichedOutgoing);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

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

  const handleCancelRequest = async (requestId: number) => {
    try {
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      setOutgoing(prevOutgoing => prevOutgoing.filter(request => request.id !== requestId));
    } catch (error) {
      console.error("Error canceling request:", error);
    }
  };

  const handleAcceptRequest = async (sender_id: string, recipient_id: string, requestId: number) => {

    try {
      // 1. Accept match
      const { error: matchError } = await supabase
        .from("matches")
        .update({ status: "accepted" })
        .eq("id", requestId);
  
      if (matchError) throw matchError;
  
      // 2. Create connection
      const { error: connectionError } = await supabase
        .from("connections")
        .insert([
          {
            request_id: requestId,
            user1_id: sender_id,
            user2_id: recipient_id,
            status: "accepted", // optional if default
          },
        ]);
  
      if (connectionError) throw connectionError;
  
      // 3. Update local state
      setIncoming(prevIncoming =>
        prevIncoming.filter(request => request.id !== requestId)
      );
    } catch (error) {
      console.error("Error handling accept request:", error);
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
                        <span>{request.age}</span>
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
                    <Button variant="outline" className="w-full" onClick={() => handleCancelRequest(request.id)}>Decline</Button>
                    <Button className="w-full" onClick={() => handleAcceptRequest(request.from_user, request.to_user, request.id)}>Accept</Button>
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
                        <span>{request.age}</span>
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
                      <Button variant="outline" className="w-full" onClick={() => handleCancelRequest(request.id)}>Cancel Request</Button>
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
