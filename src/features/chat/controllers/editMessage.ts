import { supabase } from "@/config/supabase";
import { Message } from "../types";
import { User as SupabaseUser } from '@supabase/supabase-js';

export const editMessage = async (
    message: Message,
    newText: string,
    user: SupabaseUser | null,
    toast?: any
  ) => {
    if (!user) return;
  
    try {
      const { error } = await supabase
        .from("messages")
        .update({ 
          text: newText,
          edited: true
        })
        .eq("id", message.id)
        .eq("sender_id", user.id);
  
      if (error) {
        toast?.({
          title: "Error",
          description: "Failed to edit message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast?.({
        title: "Error",
        description: "Failed to edit message. Please try again.",
        variant: "destructive",
      });
    }
  };
  