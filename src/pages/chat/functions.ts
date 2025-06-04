import { supabase } from "@/config/supabase";

export const markMessagesAsRead = async (selectedConnection, user) => {
    if (!selectedConnection || !user) return;
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("connection_id", selectedConnection.id)
      .eq("receiver_id", user.id)
      .eq("read", false);
  };

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