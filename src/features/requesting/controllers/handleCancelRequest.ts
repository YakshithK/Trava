import { supabase } from "@/config/supabase";
import { MatchRequest } from "../types";

export const handleCancelRequest = async (requestId: number, setOutgoing: React.Dispatch<React.SetStateAction<MatchRequest[]>>) => {
    try {
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      setOutgoing(prevOutgoing => prevOutgoing.filter(request => request.id !== requestId));
    } catch (error) {
      console.error("Error canceling request:", error);
    }
  };
