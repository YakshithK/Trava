import { supabase } from "@/config/supabase";
import { Connection } from "../types";
import { User as SupabaseUser } from '@supabase/supabase-js';

export const handleSendMessage = async (
    e: React.FormEvent,
    messageText: string,
    setMessageText: React.Dispatch<React.SetStateAction<string>>,
    selectedConnection: Connection | null,
    user: SupabaseUser | null,
    toast?: any,
    type: "text" | "image" = "text",
    imageUrl?: string
  ) => {
    e.preventDefault();
    if ((!messageText.trim() && !imageUrl) || !selectedConnection || !user) return;
  
    try {
      const { error } = await supabase.from("messages").insert({
        connection_id: selectedConnection.id,
        sender_id: user.id,
        receiver_id: selectedConnection.user_id,
        text: messageText.trim() || (type === "image" ? "" : ""),
        type: type,
        image_url: imageUrl,
        timestamp: new Date().toISOString()
      });
  
      if (error) {
        console.error("Failed to send message to database:", error);
        if (error.code === 'PGRST301') {
          toast?.({
            title: "Message Failed",
            description: "You can't send messages to this user. They may have blocked you.",
            variant: "destructive",
          });
        } else {
          toast?.({
            title: "Error",
            description: "Failed to send message. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast?.({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };