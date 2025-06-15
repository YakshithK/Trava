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
import { format, set } from "date-fns";
import { CalendarIcon, ArrowLeft, Plane, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/config/supabase";
import VoiceHelpDiv from "@/components/VoiceHelpDiv";
import { fetchAirlines, fetchAirports, Airline, Airport } from "../index";
import { handleAddToCalendar } from "../controllers/handleCalendar";
import { toast } from "@/components/ui/use-toast";

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
    flightNumber: "Flight Number",
    flightNumberPlaceholder: "e.g., AC056",
    dateLabel: "Date of Travel",
    datePlaceholder: "Select your travel date",
    notesLabel: "Additional Notes",
    notesPlaceholder: "Any specific requirements or preferences?",
    findCompanions: "Find Companions",
    addToCalendar: "Add to Google Calendar",
    back: "Back",
    voiceHelp: "Please fill in your trip details. Enter your departure city, destination city, airline name, and select your travel date. You can also add any additional notes or preferences. Click on Find Companions when you're done.",
  },
};

const TripPosting = () => {

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [airline, setAirline] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [flightNumber, setFlightNumber] = useState("")
  const [notes, setNotes] = useState(""); 
  const [airportList, setAirportList] = useState<Airport[]>([])
  const [airlineList, setAirlineList] = useState<Airline[]>([])

  const tripData = JSON.parse(localStorage.getItem("tripData")|| null)


  useEffect(() => {
    if (tripData) {
      setFrom(tripData.from || "");
      setTo(tripData.to || "");
      setAirline(tripData.airline || "");
      setDate(tripData.date ? new Date(tripData.date) : undefined);
      setFlightNumber(tripData.flightNumber || "");
      setNotes(tripData.notes || "");
    }

    if (tripData.date) {
      const [year, month, day] = tripData.date.split('-').map(Number);
      setDate(new Date(year, month - 1, day));
    } else {
      setDate(undefined);
    }
  }, []);

  const navigate = useNavigate();
  const text = tripTexts.en;

  useEffect(() => {

    fetchAirports(setAirportList)
    fetchAirlines(setAirlineList)
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
      flight_number: flightNumber,
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
                  value={to}
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
                  value={from}
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
                {text.flightNumber}
              </Label>
              <Input
                id="flight-number"
                placeholder={text.flightNumberPlaceholder}
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xl">
                {text.notesLabel}
              </Label>
              <Textarea
                id="notes"
                placeholder={text.notesPlaceholder}
                className="min-h-[100px] text-lg rounded-xl border-2 border-saath-light-gray"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="pt-4 space-y-4">
              <Button
                type="submit"
                className="w-full large-button bg-saath-saffron hover:bg-saath-saffron/90 text-black flex items-center justify-center gap-2"
              >
                <Plane className="h-5 w-5" />
                {text.findCompanions}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full large-button border-saath-saffron text-saath-saffron hover:bg-saath-saffron hover:text-black flex items-center justify-center gap-2"
                onClick={async () => {
                  try {
                    if (!date) {
                      throw new Error('Please select a date first');
                    }
                    const result = await handleAddToCalendar({
                      from: from,
                      to: to,
                      date: date,
                      flightNumber: flightNumber,
                      notes: notes
                    });
                    if (result.success) {
                      toast({
                        title: "Success",
                        description: "Trip added to your Google Calendar",
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: error instanceof Error ? error.message : "Failed to add to calendar",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <CalendarPlus className="h-5 w-5" />
                {text.addToCalendar}
              </Button>
            </div>
          </form>
        </Card>

        <VoiceHelpDiv text={text.voiceHelp} />
      </main>
    </div>
  );
};

export default TripPosting;
