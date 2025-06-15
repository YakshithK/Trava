import { supabase } from "@/config/supabase";
import { Message } from "../types";
import { User as SupabaseUser } from '@supabase/supabase-js';

export const fetchMessages = async (matchId: string, 
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>, 
  user: SupabaseUser | null) => {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      reactions:message_reactions (
        emoji,
        user_id
      )
    `)
    .eq("connection_id", matchId)
    .order("timestamp", { ascending: true });
  
  if (error) {
    console.error("Error fetching messages:", error);
  } else {
    setMessages(
      data.map((msg) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender_id === user?.id ? "user" : "match",
        read: msg.read ? true : false,
        timestamp: new Date(msg.timestamp),
        type: msg.type || "text",
        imageUrl: msg.image_url,
        edited: msg.edited,
        reactions: msg.reactions
      }))
    );
  }
};