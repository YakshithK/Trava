import { supabase } from "@/config/supabase";
import { Connection } from "../types";
import { User as SupabaseUser } from '@supabase/supabase-js';

export const markMessagesAsRead = async (
    selectedConnection: Connection | null, user: SupabaseUser | null
    ) => {
      if (!selectedConnection || !user) return;
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("connection_id", selectedConnection.id)
        .eq("receiver_id", user.id)
        .eq("read", false);
    };