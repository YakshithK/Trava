import { supabase } from "@/config/supabase";
import { Connection } from "./types";

export const markMessagesAsRead = async (selectedConnection, user) => {
    if (!selectedConnection || !user) return;
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("connection_id", selectedConnection.id)
      .eq("receiver_id", user.id)
      .eq("read", false);
  };

export const handleTyping = (typingChannel, user) => {
    if (!typingChannel.current || !user) return
    typingChannel.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId: user.id,
        name: user.user_metadata?.name || "User",
      },
    })
  }

export const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

export const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

export const handleSendMessage = async (e: React.FormEvent, messageText, setMessageText, selectedConnection, user) => {
    e.preventDefault();
    if (messageText.trim() === "" || !selectedConnection || !user) return;

    const messageToSend = messageText.trim();
    setMessageText("");

    // Only send to Supabase, do not add to UI optimistically
    try {
      const { error } = await supabase.from("messages").insert({
        connection_id: selectedConnection.id,
        sender_id: user.id,
        receiver_id: selectedConnection.user_id,
        text: messageToSend,
        timestamp: new Date().toISOString()
      });

      if (error) {
        console.error("Failed to send message to database:", error);
        // Optionally show a subtle indicator that the message failed to send
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

export const fetchConnections = async (setUser, setConnections ) => {

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
      console.log("connections", data)
      const userIds = data.map((profile) => (user.id === profile.user1_id ? profile.user2_id : profile.user1_id));

      const { data: profiles, error: profileError } = await supabase
        .from("users")
        .select("id, name, age, photo")
        .in("id", userIds);


      const enrichedConnections: Connection[] = data.map((connection) => {
        const userProfile = profiles.find((p) => p.id === (user.id === connection.user1_id ? connection.user2_id : connection.user1_id));
        return {
          id: connection.id,
          user_id: userProfile.id,
          name: userProfile?.name || "Unknown",
          photoUrl: userProfile?.photo || undefined,
          lastMessage: connection.lastMessage || "No messages yet",
          lastMessageTime: connection.lastMessageTime || new Date(),
          isOnline: connection.isOnline || false,
        };
      });

      setConnections(enrichedConnections);
    };

export const fetchMessages = async (matchId, setMessages, user) => {
          const { data, error } = await supabase
            .from("messages")
            .select("*")
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
              }))
            );
          }
        };

export const handleConnectionSelect = (connection: Connection, selectedConnection, navigate) => {
    navigate(`/chat/${connection.id}`);
    console.log(selectedConnection)
  };