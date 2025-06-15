import { supabase } from "@/config/supabase";
import { Message } from "../types";
import { User as SupabaseUser } from '@supabase/supabase-js';

export const deleteMessage = async (
    message: Message,
    user: SupabaseUser | null,
    toast?: any
  ) => {
    if (!user) return;
  
    try {
      if (message.type === "image" && message.imageUrl) {
        const urlParts = message.imageUrl.split('/')
        const fileName = urlParts[urlParts.length-1].split("?")[0]
  
        const {error: storageError} = await supabase.storage
          .from('chat-images')
          .remove([fileName])
        console.log("removed image")
        if (storageError) {
          console.error("Error deleting image from storage: ", storageError)
          toast?.({
            title: "Error",
            description: "Failed to delete image from storage bucket. Please try again.",
            variant: "destructive"
          })
        }
      }
  
      const {error} = await supabase
        .from("messages")
        .delete()
        .eq("id", message.id)
        .eq("sender_id", user.id)
  
      if (error) {
        console.error("Error deleting message: ", error)
        toast?.({
          title: "Error",
          description: "Failed to delete message. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error while deleting message: ", error)
      toast?.({
        title: "Error",
        description: "Failed to delete message. Please try again",
        variant: "destructive"
      })
    }
  }