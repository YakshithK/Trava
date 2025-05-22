import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Send, User } from "lucide-react";
import VoiceHelp from "@/components/VoiceHelp";
import LanguageSelector from "@/components/LanguageSelector";
import { supabase } from "@/config/supabase";

interface TravelMatch {
  user_id: string;
  trip_id: number;
  name: string;
  age: number;
  language: string;
  from_city: string;
  to_city: string;
  date: string;
  photo_url?: string;
}

const languageNames: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
};


const matchTexts = {
  en: {
    title: "Potential Travel Companions",
    subtitle: "These travelers have similar plans",
    language: "Language",
    age: "Age",
    route: "Route",
    contactButton: "Request to Travel Together",
    noMatches: "No matches found. Check back later!",
    voiceHelp:
      "This page shows potential travel companions matching your trip. Each card shows the traveler's name, age, language, and travel route. Click on 'Request to Travel Together' to connect with someone.",
  },
  hi: {
    title: "संभावित यात्रा साथी",
    subtitle: "इन यात्रियों की योजनाएं समान हैं",
    language: "भाषा",
    age: "आयु",
    route: "मार्ग",
    contactButton: "एक साथ यात्रा करने का अनुरोध करें",
    noMatches: "कोई मिलान नहीं मिला। बाद में फिर से जांचें!",
    voiceHelp:
      "यह पेज आपकी यात्रा से मेल खाने वाले संभावित यात्रा साथियों को दिखाता है। प्रत्येक कार्ड यात्री का नाम, उम्र, भाषा और यात्रा मार्ग दिखाता है। किसी से संपर्क करने के लिए 'एक साथ यात्रा करने का अनुरोध करें' पर क्लिक करें।",
  },
  te: {
    title: "సంభావ్య ప్రయాణ సహచరులు",
    subtitle: "ఈ ప్రయాణికులకు సమాన ప్రణాళికలు ఉన్నాయి",
    language: "భాష",
    age: "వయస్సు",
    route: "మార్గం",
    contactButton: "కలిసి ప్రయాణించడానికి అభ్యర్థన",
    noMatches: "మ్యాచ్‌లు కనుగొనబడలేదు. తర్వాత మళ్లీ తనిఖీ చేయండి!",
    voiceHelp:
      "ఈ పేజీ మీ ప్రయాణానికి సరిపోయే సంభావ్య ప్రయాణ సహచరులను చూపుతుంది. ప్రతి కార్డు ప్రయాణికుని పేరు, వయస్సు, భాష మరియు ప్రయాణ మార్గాన్ని చూపుతుంది. ఎవరితోనైనా కనెక్ట్ అవ్వడానికి 'కలిసి ప్రయాణించడానికి అభ్యర్థన' క్లిక్ చేయండి.",
  },
};

const Matches = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en");
  const text = matchTexts[language];

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
        .select("id, name, age, language, photo")
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
          language: userProfile?.language || "Unknown",
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
      alert("Failed to send request.");
    } else {
      alert("Request sent successfully!");
    }
  };


  return (
    <div className="min-h-screen bg-saath-cream">
      <header className="p-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          className="text-saath-gray"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <LanguageSelector
          onChange={(lang) => setLanguage(lang as "en" | "hi" | "te")}
          defaultLanguage={language}
        />
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
                className="bg-white p-6 rounded-3xl shadow-md border-none overflow-hidden"
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
                      <div>
                        <span className="font-medium">{text.language}:</span>{" "}
                        {languageNames[match.language] || match.language}
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium">{text.route}:</span>{" "}
                        {match.from_city} → {match.to_city} ({match.date})
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
          <Card className="bg-white p-8 rounded-3xl shadow-md border-none text-center">
            <p className="text-xl text-gray-600">{text.noMatches}</p>
          </Card>
        )}

        <div className="mt-6 flex justify-center">
          <VoiceHelp text={text.voiceHelp} language={language} />
        </div>
      </main>
    </div>
  );
};

export default Matches;
