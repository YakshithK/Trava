import { supabase } from "@/config/supabase";
import { Connection, Message } from "./types";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';
import React from "react";
import { NavigateFunction } from "react-router-dom";


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

export const handleTyping = (typingChannel : React.MutableRefObject<RealtimeChannel | null>, user: SupabaseUser | null) => {
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

export const handleSendMessage = async (e: React.FormEvent, 
  messageText: string, 
  setMessageText: React.Dispatch<React.SetStateAction<string>>, 
  selectedConnection: Connection | null, 
  user: SupabaseUser | null,
  toast?: any) => {
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

export const fetchMessages = async (matchId: string, 
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>, 
  user: SupabaseUser | null) => {
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

export const handleConnectionSelect = (connection: Connection, 
  selectedConnection: Connection | null, 
  navigate: NavigateFunction) => {
    navigate(`/chat/${connection.id}`);
    console.log(selectedConnection)
  };