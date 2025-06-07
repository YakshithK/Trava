import { supabase } from "@/config/supabase";
import React from "react";
import {Toast, TravelMatch } from "./types";

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

export const handleContactRequest = async (
  matchUserId: string,
  tripId: number,
  toast: (props: Toast) => { id: string; dismiss: () => void; update: (props: any) => void }
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const {data: existingRequests, error: existingError} = await supabase
      .from("matches")
      .select("*")
      .eq("from_user", user.id)
      .eq("to_user", matchUserId)
      .eq("trip_id", tripId)
      .in("status", ["pending", "accepted"]);

    const {data: existingConnections, error: existingConnectionsError} = await supabase
      .from("connections")
      .select("*")
      .eq("request_id", existingRequests && existingRequests[0]?.id); 

      console.log("Existing connections:", existingConnections);

    if ((existingRequests && existingRequests.length > 0) || (existingConnections && existingConnections.length > 0) ) {
      toast({
        title: "Request Already Sent",
        description: "You have already sent a request or are already connected with this user for this trip.",
        variant: "destructive",
      })
      return;
    }

    const { error } = await supabase.from("matches").insert([
      {
        from_user: user.id,
        to_user: matchUserId,
        trip_id: tripId,
        status: "pending",
      },
    ]);

    if (error) {
      console.error("Error sending match request:", error);
      toast({
        title: "Request Failed",
        description: "Failed to send travel request. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Request Sent!",
        description: "Your travel request has been sent successfully.",
      });
    }
  };