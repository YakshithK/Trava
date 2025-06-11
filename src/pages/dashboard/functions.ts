import { supabase } from "@/config/supabase";
import { User as SupabaseUser } from '@supabase/supabase-js';
import React from "react";
import { Request } from "./types";

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

export const fetchRequests = async (setLoading : React.Dispatch<React.SetStateAction<boolean>>, setRequests : React.Dispatch<React.SetStateAction<Request[]>>) => {
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

        // Helper to fetch enriched request data
        const enrichRequests = async (
          matches: any[],
          isIncoming: boolean
        ): Promise<Request[]> => {
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

          // Map enriched data
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

        setRequests(enrichedIncoming);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

export const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };