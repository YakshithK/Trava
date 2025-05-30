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
import { supabase } from "@/config/supabase";
import { error } from "console";
import Papa from "papaparse"

type Airport = {
  iata_code: string,
  name: string,
  municipality: string,
  iso_country: string
}

type Airline = {
  code: string,
  name: string
}

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
};

const TripPosting = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [airline, setAirline] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState(""); 
  const [airportList, setAirportList] = useState<Airport[]>([])
  const [airlineList, setAirlineList] = useState<Airline[]>([])

  const navigate = useNavigate();
  const text = tripTexts.en;

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching session:", error);
      }
    };

    const fetchAirports = async () => {
      fetch("/data/airports-short.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setAirportList(results.data)
          }
        })
      })
    }

    const fetchAirlines = async () => {
      fetch("/data/airlines-short.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const airlines = results.data.map((airline: any) => ({
              code: airline.code,
              name: airline.name
            }));
            setAirlineList(airlines);
          }
        })
      })
    }

    fetchData()
    fetchAirports()
    fetchAirlines()
  }, []);

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

        <Card className="bg-card p-6 rounded-3xl shadow-md border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="from" className="text-xl">
                {text.toLabel}
              </Label>
              <select
                  id="from"
                  className="h-14 text-lg rounded-xl border-2 border-saath-light-gray w-full"
                  required
                  onChange={(e) => setTo(e.target.value)}
                >
                <option value="">Select departure airport</option>
                {airportList.map((airport, index) => (
                  <option key={index} value={airport.iata_code}>
                    {airport.name} ({airport.iata_code}) - {airport.municipality}, {airport.iso_country}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from" className="text-xl">
                {text.fromLabel}
              </Label>
              <select
                  id="from"
                  className="h-14 text-lg rounded-xl border-2 border-saath-light-gray w-full"
                  required
                  onChange={(e) => setFrom(e.target.value)}
                >
                <option value="">Select departure airport</option>
                {airportList.map((airport, index) => (
                  <option key={index} value={airport.iata_code}>
                    {airport.name} ({airport.iata_code}) - {airport.municipality}, {airport.iso_country}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="airline" className="text-xl">
                {text.airlineLabel}
              </Label>
              <select
                id="airline"
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray w-full"
                required
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
              >
                <option value="">Select airline</option>
                {airlineList.map((airline, index) => (
                  <option key={index} value={airline.code}>
                    {airline.name} ({airline.code})
                  </option>
                ))}
              </select>
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
          <VoiceHelp text={text.voiceHelp} />
        </div>
      </main>
    </div>
  );
};

export default TripPosting;
