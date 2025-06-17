import { useUserStore } from "@/store/userStore";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Plus, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/authContext";
import { useToast } from "@/hooks/use-toast";
import { Request, fetchRequests, fetchTrips, formatDate, deleteTrip, FullRequests, Timeline } from "@/features/dashboard";
import { supabase } from "@/config/supabase";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentMessage {
  id: string;
  text: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    photo: string;
  };
  connection_id: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trips, setTrips] = useState<any[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCode, setUserCode] = useState("");
  const { t } = useTranslation();
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTrips(user, setLoading, setTrips);
      fetchRequests(setLoading, setRequests);
      // Fetch user's code
      const fetchUserCode = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('code')
          .eq('id', user.id)
          .single();
        if (data && !error) {
          setUserCode(data.code);
        }
      };
      fetchUserCode();
    }
  }, [user]);

  useEffect(() => {
    const fetchRecentMessages = async () => {
      if (!user) return;

      try {
        // Get the most recent message from each connection
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            text,
            timestamp,
            connection_id,
            sender:sender_id (
              id,
              name,
              photo
            )
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('timestamp', { ascending: false })
          .limit(5);

        if (error) throw error;

        // Group messages by connection and get the most recent one
        const uniqueConnections = new Map();
        data.forEach((message) => {
          if (!uniqueConnections.has(message.connection_id)) {
            uniqueConnections.set(message.connection_id, message);
          }
        });

        setRecentMessages(Array.from(uniqueConnections.values()));
      } catch (error) {
        console.error('Error fetching recent messages:', error);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchRecentMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('recent_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user?.id} OR receiver_id=eq.${user?.id}`
        },
        (payload) => {
          fetchRecentMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.welcome')}
          </p>
        </div>
      </div>

      {/* Referral Code */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{t('dashboard.inviteFriends.title')}</h2>
              <p className="text-muted-foreground max-w-md">
                {t('dashboard.inviteFriends.description')}
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                value={userCode}
                readOnly
                className="bg-muted w-[120px]"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/onboarding?ref=${userCode}`);
                  toast({
                    title: t('dashboard.inviteFriends.copied'),
                    description: t('dashboard.inviteFriends.copiedDescription'),
                  });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Trip CTA */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{t('dashboard.postTrip.title')}</h2>
              <p className="text-muted-foreground max-w-md">
                {t('dashboard.postTrip.description')}
              </p>
            </div>
            <Button asChild size="lg" className="w-full md:w-auto">
              <Link to="/trip-posting" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>{t('dashboard.postTrip.button')}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-column layout for trips and timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Trips */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{t('dashboard.upcomingTrips.title')}</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/trip-posting">{t('dashboard.upcomingTrips.addTrip')}</Link>
            </Button>
          </div>

          {trips.length > 0 ? (
            <div className="space-y-4">
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
                              <AlertDialogTitle>{t('dashboard.upcomingTrips.deleteTrip.title')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('dashboard.upcomingTrips.deleteTrip.description', { destination: trip.to })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('dashboard.upcomingTrips.deleteTrip.cancel')}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteTrip(trip.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t('dashboard.upcomingTrips.deleteTrip.confirm')}
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
                        {t('dashboard.upcomingTrips.findCompanions')}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">{t('dashboard.upcomingTrips.noTrips')}</p>
              <Button asChild>
                <Link to="/trip-posting">{t('dashboard.upcomingTrips.postFirstTrip')}</Link>
              </Button>
            </Card>
          )}
        </div>

        {/* Travel Timeline */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Travel Timeline</h2>
          <Timeline trips={trips} />
        </div>
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
        {messagesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : recentMessages.length > 0 ? (
          <div className="space-y-4">
            {recentMessages.map((message) => (
              <Card key={message.id} className="p-4 hover:bg-accent/50 transition-colors">
                <Link to={`/chat/${message.connection_id}`} className="block">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={message.sender.photo} />
                      <AvatarFallback>
                        {message.sender.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium truncate">{message.sender.name}</p>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{message.text}</p>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              You don't have any active conversations.
            </p>
            <Button asChild variant="outline">
              <Link to="/matches">Find Travel Companions</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
