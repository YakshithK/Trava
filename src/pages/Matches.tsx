import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Send, User } from "lucide-react";
import VoiceHelp from "@/components/VoiceHelp";
import { supabase } from "@/config/supabase";
import { useToast } from "@/hooks/use-toast";

interface TravelMatch {
  user_id: string;
  trip_id: number;
  name: string;
  age: number;
  from_city: string;
  to_city: string;
  date: string;
  photo_url?: string;
}

const matchTexts = {
  en: {
    title: "Potential Travel Companions",
    subtitle: "These travelers have similar plans",
    age: "Age",
    route: "Route",
    contactButton: "Request to Travel Together",
    noMatches: "No matches found. Check back later!",
    voiceHelp:
      "This page shows potential travel companions matching your trip. Each card shows the traveler's name, age, and travel route. Click on 'Request to Travel Together' to connect with someone.",
  },
};

const Matches = () => {
  const navigate = useNavigate();
  const text = matchTexts.en;
  const { toast } = useToast();

  const [matches, setMatches] = useState<TravelMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Get the current user's trip
      const { data: myTrips, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .limit(1);

      if (tripError || !myTrips || myTrips.length === 0) {
        console.error("No trip found for current user.");
        setLoading(false);
        return;
      }

      const myTrip = myTrips[0];

      // Find matching trips (same from, to, and date)
      const { data: rawMatches, error: matchError } = await supabase
        .from("trips")
        .select("*")
        .eq("from", myTrip.from)
        .eq("to", myTrip.to)
        .eq("date", myTrip.date)
        .eq("airline", myTrip.airline)
        .neq("user_id", user.id);

      if (matchError) {
        console.error("Error fetching matches:", matchError);
        setLoading(false);
        return;
      }

      // Get user profiles for each match
      const userIds = rawMatches.map((trip) => trip.user_id);

      const { data: profiles, error: profileError } = await supabase
        .from("users")
        .select("id, name, age, photo")
        .in("id", userIds);

      if (profileError) {
        console.error("Error fetching profiles:", profileError);
        setLoading(false);
        return;
      }

      // Join trips + profiles
      const enrichedMatches: TravelMatch[] = rawMatches.map((trip) => {
        const userProfile = profiles.find((p) => p.id === trip.user_id);
        return {
          user_id: trip.user_id,
          trip_id: trip.id,
          name: userProfile?.name || "Unknown",
          age: userProfile?.age || 0,
          from_city: trip.from,
          to_city: trip.to,
          date: trip.date,
          photo_url: userProfile?.photo || undefined,
        };
      });

      setMatches(enrichedMatches);
      setLoading(false);
    };

    fetchMatches();
  }, []);

  const handleContactRequest = async (matchUserId: string, tripId: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("matches").insert([
      {
        from_user: user.id,
        to_user: matchUserId,
        trip_id: tripId,
        status: "pending", // optional
      },
    ]);

    if (error) {
      console.error("Error sending match request:", error);
      toast({
        title: "Request Failed",
        description: "Failed to send travel request. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Request Sent!",
        description: "Your travel request has been sent successfully.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          className="text-saath-gray"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </header>

      <main className="page-container">
        <div className="mb-8 text-center">
          <h1 className="mb-2">{text.title}</h1>
          <p className="text-gray-600">{text.subtitle}</p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading matches...</p>
        ) : matches.length > 0 ? (
          <div className="space-y-6">
            {matches.map((match) => (
              <Card
                key={match.trip_id}
                className="bg-card p-6 rounded-3xl shadow-md border overflow-hidden"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="h-24 w-24 rounded-full flex-shrink-0 overflow-hidden bg-saath-light-gray">
                    {match.photo_url ? (
                      <img
                        src={match.photo_url}
                        alt={match.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-semibold mb-2">
                      {match.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-lg">
                      <div>
                        <span className="font-medium">{text.age}:</span>{" "}
                        {match.age}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-center md:justify-end">
                  <Button
                    onClick={() => handleContactRequest(match.user_id, match.trip_id)}
                    className="large-button bg-saath-green hover:bg-saath-green/90 text-black flex gap-2 items-center"
                  >
                    <Send className="h-5 w-5" />
                    {text.contactButton}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card p-8 rounded-3xl shadow-md border text-center">
            <p className="text-xl text-gray-600">{text.noMatches}</p>
          </Card>
        )}

        <div className="mt-6 flex justify-center">
          <VoiceHelp text={text.voiceHelp} />
        </div>
      </main>
    </div>
  );
};

export default Matches;
