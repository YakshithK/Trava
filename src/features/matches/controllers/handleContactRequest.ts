import { supabase } from "@/config/supabase";
import { Toast } from "../types";

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