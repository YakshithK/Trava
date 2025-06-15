import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Send, User } from "lucide-react";
import VoiceHelp from "@/components/VoiceHelp";
import { useToast } from "@/hooks/use-toast";
import { TravelMatch, fetchMatches, handleContactRequest } from "../features/matches"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    fetchMatches(setLoading, setMatches);
  }, []);

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
                    <Avatar className="h-full w-full">
                      <AvatarImage src={match.photo_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-100">
                        <User className="h-12 w-12 text-gray-400" />
                      </AvatarFallback>
                    </Avatar>
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
                    onClick={() => handleContactRequest(match.user_id, match.trip_id, toast)}
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

        <VoiceHelp text={text.voiceHelp} />
      </main>
    </div>
  );
};

export default Matches;
