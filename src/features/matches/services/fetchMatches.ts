import { supabase } from "@/config/supabase";
import { TravelMatch } from "../types";

export const fetchMatches = async (setLoading: React.Dispatch<React.SetStateAction<boolean>>, setMatches: React.Dispatch<React.SetStateAction<TravelMatch[]>>) => {
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