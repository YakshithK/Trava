import { supabase } from "@/config/supabase";
import { Connection } from "../types";
import { User as SupabaseUser } from '@supabase/supabase-js';

export const fetchConnections = async (setUser: React.Dispatch<React.SetStateAction<SupabaseUser | null>>, 
    setConnections: React.Dispatch<React.SetStateAction<Connection[] | null>> ) => {
  
        const {
          data: { user },
        } = await supabase.auth.getUser();
  
        setUser(user)
  
        if (!user) return;
  
        const { data, error } = await supabase
        .from("connections")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        
        if (error) {
          console.error("Error fetching connections:", error);
        }
  
        const userIds = data.map((profile) => (user.id === profile.user1_id ? profile.user2_id : profile.user1_id));
  
        const { data: profiles, error: profileError } = await supabase
          .from("users")
          .select("id, name, age, photo")
          .in("id", userIds);
  
        // Fetch last messages for each connection
        const lastMessagesPromises = data.map(async (connection) => {
          const { data: messages, error: messagesError } = await supabase
            .from("messages")
            .select("*")
            .eq("connection_id", connection.id)
            .order("timestamp", { ascending: false })
            .limit(1);
  
          if (messagesError) {
            console.error("Error fetching last message:", messagesError);
            return null;
          }
  
          return messages[0] || null;
        });
  
        const lastMessages = await Promise.all(lastMessagesPromises);
  
        const enrichedConnections: Connection[] = data.map((connection, index) => {
          const userProfile = profiles.find((p) => p.id === (user.id === connection.user1_id ? connection.user2_id : connection.user1_id));
          const lastMessage = lastMessages[index];
          
          return {
            id: connection.id,
            user_id: userProfile.id,
            name: userProfile?.name || "Unknown",
            photoUrl: userProfile?.photo || undefined,
            lastMessage: lastMessage?.text || "No messages yet",
            lastMessageTime: lastMessage ? new Date(lastMessage.timestamp) : new Date(),
            isOnline: connection.isOnline || false,
          };
        });
  
        setConnections(enrichedConnections);
    };