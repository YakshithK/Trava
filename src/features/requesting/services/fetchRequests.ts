import { supabase } from "@/config/supabase";
import { MatchRequest } from "../types";

export const fetchRequests = async (setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setIncoming: React.Dispatch<React.SetStateAction<MatchRequest[]>>,
    setOutgoing: React.Dispatch<React.SetStateAction<MatchRequest[]>>

    ) => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch incoming requests: matches where current user is to_user
        const { data: incomingMatches, error: incomingError } = await supabase
          .from("matches")
          .select("id, from_user, to_user, trip_id, status")
          .eq("to_user", user.id)
          .eq("status", "pending");

        if (incomingError) throw incomingError;

        // Fetch outgoing requests: matches where current user is from_user
        const { data: outgoingMatches, error: outgoingError } = await supabase
          .from("matches")
          .select("id, to_user, trip_id, status")
          .eq("from_user", user.id)
          .eq("status", "pending");

        if (outgoingError) throw outgoingError;

        // Helper to fetch enriched request data
        const enrichRequests = async (
          matches: any[],
          isIncoming: boolean
        ): Promise<MatchRequest[]> => {
          if (!matches || matches.length === 0) return [];

          // Collect user IDs for profiles:
          // For incoming requests, other user is from_user
          // For outgoing requests, other user is to_user
          const otherUserIds = matches.map((m) =>
            isIncoming ? m.from_user : m.to_user
          );

          // Fetch user profiles
          const { data: profiles, error: profileError } = await supabase
            .from("users")
            .select("id, name, age, photo")
            .in("id", otherUserIds);

          if (profileError) throw profileError;

          // Fetch trips for these requests
          const tripIds = matches.map((m) => m.trip_id);
          const { data: trips, error: tripsError } = await supabase
            .from("trips")
            .select("id, from, to, date")
            .in("id", tripIds);

          if (tripsError) throw tripsError;

          return matches.map((m) => {
            const otherUserId = isIncoming ? m.from_user : m.to_user;
            const profile = profiles.find((p) => p.id === otherUserId);
            const trip = trips.find((t) => t.id === m.trip_id);

            return {
              id: m.id,
              from_user: m.from_user,
              to_user: m.to_user,
              name: profile?.name || "Unknown",
              age: profile?.age || 0,
              photoUrl: profile?.photo || "",
              from: trip?.from || "",
              to: trip?.to || "",
              date: trip?.date || "",
              status: m.status,
            };
          });
        };

        const enrichedIncoming = await enrichRequests(incomingMatches, true);
        const enrichedOutgoing = await enrichRequests(outgoingMatches, false);

        setIncoming(enrichedIncoming);
        setOutgoing(enrichedOutgoing);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
  };