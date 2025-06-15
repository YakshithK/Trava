import { supabase } from "@/config/supabase";
import { MatchRequest } from "../types";

export const handleAcceptRequest = async (sender_id: string, recipient_id: string, requestId: number, setIncoming: React.Dispatch<React.SetStateAction<MatchRequest[]>>) => {

    try {
      // 1. Accept match
      const { error: matchError } = await supabase
        .from("matches")
        .update({ status: "accepted" })
        .eq("id", requestId);
  
      if (matchError) throw matchError;
  
      // 2. Create connection
      const { error: connectionError } = await supabase
        .from("connections")
        .insert([
          {
            request_id: requestId,
            user1_id: sender_id,
            user2_id: recipient_id,
            status: "accepted", // optional if default
          },
        ]);
  
      if (connectionError) throw connectionError;
  
      // 3. Update local state
      setIncoming(prevIncoming =>
        prevIncoming.filter(request => request.id !== requestId)
      );
    } catch (error) {
      console.error("Error handling accept request:", error);
    }
  };