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
import { fetchAirlines, fetchAirports, Airline, Airport } from "../index";
import { handleAddToCalendar } from "../controllers/handleCalendar";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

const TripPosting = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [airline, setAirline] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [flightNumber, setFlightNumber] = useState("")
  const [notes, setNotes] = useState(""); 
  const [airportList, setAirportList] = useState<Airport[]>([])
  const [airlineList, setAirlineList] = useState<Airline[]>([])
  const { t } = useTranslation();

  const tripDataRaw = localStorage.getItem("tripData");
  const tripData = tripDataRaw ? JSON.parse(tripDataRaw) : null;

  useEffect(() => {
    if (tripData) {
      setFrom(tripData.from || "");
      setTo(tripData.to || "");
      setAirline(tripData.airline || "");
      setDate(tripData.date ? new Date(tripData.date) : undefined);
      setFlightNumber(tripData.flightNumber || "");
      setNotes(tripData.notes || "");
    }
  }, []);

  const navigate = useNavigate();

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

    localStorage.removeItem("tripData");

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
          <h1 className="mb-2">{t('tripPosting.title')}</h1>
          <p className="text-gray-600">{t('tripPosting.subtitle')}</p>
        </div>

        <Card className="bg-card p-6 rounded-3xl shadow-md border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="from" className="text-xl">
                {t('tripPosting.toLabel')}
              </Label>
              <select
                  id="from"
                  className="h-14 text-lg rounded-xl border-2 border-saath-light-gray w-full"
                  required
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                >
                <option value="">{t('tripPosting.toPlaceholder')}</option>
                {airportList.map((airport, index) => (
                  <option key={index} value={airport.iata_code}>
                    {airport.name} ({airport.iata_code}) - {airport.municipality}, {airport.iso_country}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from" className="text-xl">
                {t('tripPosting.fromLabel')}
              </Label>
              <select
                  id="from"
                  className="h-14 text-lg rounded-xl border-2 border-saath-light-gray w-full"
                  required
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                >
                <option value="">{t('tripPosting.fromPlaceholder')}</option>
                {airportList.map((airport, index) => (
                  <option key={index} value={airport.iata_code}>
                    {airport.name} ({airport.iata_code}) - {airport.municipality}, {airport.iso_country}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="airline" className="text-xl">
                {t('tripPosting.airlineLabel')}
              </Label>
              <select
                id="airline"
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray w-full"
                required
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
              >
                <option value="">{t('tripPosting.airlinePlaceholder')}</option>
                {airlineList.map((airline, index) => (
                  <option key={index} value={airline.code}>
                    {airline.name} ({airline.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-xl">
                {t('tripPosting.dateLabel')}
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
                    {date ? format(date, "PPP") : t('tripPosting.datePlaceholder')}
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
                {t('tripPosting.flightNumber')}
              </Label>
              <Input
                id="flight-number"
                placeholder={t('tripPosting.flightNumberPlaceholder')}
                className="h-14 text-lg rounded-xl border-2 border-saath-light-gray"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xl">
                {t('tripPosting.notesLabel')}
              </Label>
              <Textarea
                id="notes"
                placeholder={t('tripPosting.notesPlaceholder')}
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
                {t('tripPosting.findCompanions')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full large-button flex items-center justify-center gap-2"
                onClick={() => handleAddToCalendar({ from, to, date, airline, flightNumber })}
              >
                <CalendarPlus className="h-5 w-5" />
                {t('tripPosting.addToCalendar')}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default TripPosting;
