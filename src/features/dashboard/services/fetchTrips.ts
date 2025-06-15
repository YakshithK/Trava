import { supabase } from "@/config/supabase";
import { User as SupabaseUser } from '@supabase/supabase-js';


export const fetchTrips = async (user: SupabaseUser, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setTrips: React.Dispatch<React.SetStateAction<any>>) => {
    try {
      // Fetch trips from Supabase
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user?.id); // Assuming each trip is associated with a user via user_id

      if (error) {
        throw new Error(error.message);
      }

      setTrips(data || []); // Set the trips data to state
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false); // Stop the loading state once data is fetched
    }
};