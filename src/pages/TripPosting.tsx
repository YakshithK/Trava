
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import VoiceHelp from "@/components/VoiceHelp";
import LanguageSelector from "@/components/LanguageSelector";
import { supabase } from "@/config/supabase";
import { error } from "console";

const tripTexts = {
  en: {
    title: "Post Your Trip",
    subtitle: "Share your travel plans to find companions",
    fromLabel: "From City",
    fromPlaceholder: "e.g., Hyderabad",
    toLabel: "To City",
    toPlaceholder: "e.g., Toronto",
    airlineLabel: "Airline",
    airlinePlaceholder: "e.g., Air India",
    dateLabel: "Date of Travel",
    datePlaceholder: "Select your travel date",
    notesLabel: "Additional Notes",
    notesPlaceholder: "Any specific requirements or preferences?",
    findCompanions: "Find Companions",
    back: "Back",
    voiceHelp: "Please fill in your trip details. Enter your departure city, destination city, airline name, and select your travel date. You can also add any additional notes or preferences. Click on Find Companions when you're done.",
  },
  hi: {
    title: "अपनी यात्रा पोस्ट करें",
    subtitle: "साथियों को खोजने के लिए अपनी यात्रा योजनाएं साझा करें",
    fromLabel: "किस शहर से",
    fromPlaceholder: "जैसे, हैदराबाद",
    toLabel: "किस शहर को",
    toPlaceholder: "जैसे, टोरंटो",
    airlineLabel: "एयरलाइन",
    airlinePlaceholder: "जैसे, एयर इंडिया",
    dateLabel: "यात्रा की तारीख",
    datePlaceholder: "अपनी यात्रा की तारीख चुनें",
    notesLabel: "अतिरिक्त नोट्स",
    notesPlaceholder: "कोई विशेष आवश्यकताएं या प्राथमिकताएं?",
    findCompanions: "साथी खोजें",
    back: "वापस",
    voiceHelp: "कृपया अपनी यात्रा विवरण भरें। अपने प्रस्थान शहर, गंतव्य शहर, एयरलाइन का नाम दर्ज करें और अपनी यात्रा तिथि चुनें। आप अतिरिक्त नोट्स या प्राथमिकताएं भी जोड़ सकते हैं। जब आप पूरा कर लें, तो साथी खोजें पर क्लिक करें।",
  },
  te: {
    title: "మీ ప్రయాణాన్ని పోస్ట్ చేయండి",
    subtitle: "సహచరులను కనుగొనడానికి మీ ప్రయాణ ప్రణాళికలను షేర్ చేయండి",
    fromLabel: "నుండి నగరం",
    fromPlaceholder: "ఉదా., హైదరాబాద్",
    toLabel: "నగరానికి",
    toPlaceholder: "ఉదా., టొరంటో",
    airlineLabel: "ఎయిర్‌లైన్",
    airlinePlaceholder: "ఉదా., ఎయిర్ ఇండియా",
    dateLabel: "ప్రయాణం తేదీ",
    datePlaceholder: "మీ ప్రయాణం తేదీని ఎంచుకోండి",
    notesLabel: "అదనపు గమనికలు",
    notesPlaceholder: "ఏవైనా నిర్దిష్ట అవసరాలు లేదా ప్రాధాన్యతలు?",
    findCompanions: "సహచరులను కనుగొనండి",
    back: "వెనుకకు",
    voiceHelp: "దయచేసి మీ ప్రయాణ వివరాలను పూరించండి. మీ నిష్క్రమణ నగరం, గమ్యస్థానం నగరం, విమానయాన సంస్థ పేరును నమోదు చేసి, మీ ప్రయాణపు తేదీని ఎంచుకోండి. మీరు ఏవైనా అదనపు గమనికలు లేదా ప్రాధాన్యతలను కూడా జోడించవచ్చు. పూర్తయినప్పుడు సహచరులను కనుగొనండి క్లిక్ చేయండి.",
  }
};

const TripPosting = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [airline, setAirline] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState(""); 

  const navigate = useNavigate();
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en");
  const text = tripTexts[language];

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching session:", error);
      }
    };
    fetchData();
  }
  , []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error fetching user data:", userError);
      return;
    }

    const { error: insertError } = await supabase.from("trips").insert({
      user_id: userData?.user?.id,
      from,
      to,
      date: date ? date.toISOString() : null,
      airline,
      notes
    });
    
    if (insertError) {
      console.error("Error inserting trip:", insertError);
      return;
    }

    navigate("/matches");
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

        <Card className="bg-white p-6 rounded-3xl shadow-md border-none">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="from" className="text-xl">
                {text.fromLabel}
              </Label>
              <Input
                id="from"
                placeholder={text.fromPlaceholder}
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
                required
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to" className="text-xl">
                {text.toLabel}
              </Label>
              <Input
                id="to"
                placeholder={text.toPlaceholder}
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
                required
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="airline" className="text-xl">
                {text.airlineLabel}
              </Label>
              <Input
                id="airline"
                placeholder={text.airlinePlaceholder}
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
                required
                onChange={(e) => setAirline(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-xl">
                {text.dateLabel}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-14 w-full flex justify-start text-lg font-normal rounded-xl border-2 border-saath-light-gray",
                      !date && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {date ? format(date, "PPP") : text.datePlaceholder}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className="rounded-xl"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xl">
                {text.notesLabel}
              </Label>
              <Textarea
                id="notes"
                placeholder={text.notesPlaceholder}
                className="min-h-[100px] text-lg rounded-xl border-2 border-saath-light-gray"
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full large-button bg-saath-saffron hover:bg-saath-saffron/90 text-black flex items-center justify-center gap-2"
              >
                <Plane className="h-5 w-5" />
                {text.findCompanions}
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-6 flex justify-center">
          <VoiceHelp text={text.voiceHelp} language={language} />
        </div>
      </main>
    </div>
  );
};

export default TripPosting;
