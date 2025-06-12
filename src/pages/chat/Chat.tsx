import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, User, Circle, MessageCircle, Sparkles } from "lucide-react";
import VoiceHelpDiv from "@/components/VoiceHelpDiv";
import { supabase } from "@/config/supabase";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Connection, Message } from "./types";
import { fetchConnections, fetchMessages, formatLastMessageTime, formatTime, handleConnectionSelect, handleSendMessage, handleTyping, markMessagesAsRead } from "./functions";
import { NoConnection } from "./NoConnection";
import { Messages } from "./Messages";
import { FullConnections } from "./FullConnections";
import { ChatHeader } from "./ChatHeader";
import { usePresenceStore } from "@/store/presenceStore";

const chatTexts = {
  en: {
    title: "Messages",
    inputPlaceholder: "Type your message here...",
    sendButton: "Send",
    noConnectionSelected: "Select a connection to start chatting",
    connectionsTitle: "Your Connections",
    voiceHelp: "This is your messaging center. Select a connection from the left sidebar to start chatting. Type your message in the text box at the bottom and press send.",
  },
};

const Chat = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const text = chatTexts.en;

  const onlineUserIds = usePresenceStore((s) => s.onlineUserIds);
  const setOnlineUserIds = usePresenceStore((s) => s.setOnlineUserIds);
  const addOnlineUser = usePresenceStore((s) => s.addOnlineUser);
  const removeOnlineUser = usePresenceStore((s) => s.removeOnlineUser);
  
  const typingChannel = useRef<any>(null);
  const presenceChannel = useRef<any>(null);

  useEffect(() => {
    if (!selectedConnection) return;

    typingChannel.current = supabase.channel(`typing:${selectedConnection.id}`)
    typingChannel.current.subscribe()

    return () => {
      if (typingChannel.current) supabase.removeChannel(typingChannel.current);
    }
  }, [selectedConnection]);

  useEffect(() => {
    if (!typingChannel.current || !user) return;

    const channel = typingChannel.current;

    channel.on("broadcast", {event: "typing"}, (payload) => {
      if (payload.payload.userId !== user.id) {
        setIsOtherTyping(true);
        setTimeout(() => {
          setIsOtherTyping(false);
        }, 3000); // Hide typing indicator after 3 seconds
      }
    })

    return () => {
      setIsOtherTyping(false);
    }
  }, [selectedConnection, user])

  useEffect(() => {
    fetchConnections(setUser, setConnections);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: "smooth",
      block: "nearest",
      inline: "nearest"
    });
  }, [messages]);

  useEffect(() => {
    console.log("matchid", messages)
    if (matchId) {
      const connection = connections.find(c => c.id === matchId);
      if (connection) {
        setSelectedConnection(connection);

        fetchMessages(matchId, setMessages, user)
      }
    } else {
      setSelectedConnection(null);
      setMessages([]);
    }
  }, [matchId, connections, user?.id])

  useEffect(() => {
    if (!selectedConnection || !user) return;

    let channel: any;
    channel = supabase
      .channel(`messages:${selectedConnection.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'messages',
          filter: `connection_id=eq.${selectedConnection.id}`
        },
        (payload) => {
          if (!payload.new) return;
          // If it's an INSERT, add the new message if not present
          if (payload.eventType === 'INSERT') {
            const newMessage: Message = {
              id: payload.new.id,
              text: payload.new.text,
              sender: payload.new.sender_id === user.id ? "user" : "match",
              timestamp: new Date(payload.new.timestamp),
              read: payload.new.read ? true : false,
            };
            setMessages(prev => {
              if (prev.some(msg => msg.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }

          if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(msg =>
              msg.id === payload.new.id
                ? { ...msg, read: payload.new.read ? true : false }
                : msg
            ));
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [selectedConnection?.id, user?.id]);

  useEffect(() => {
    // Mark as read when messages are loaded or updated
    if (messages.length > 0) {
      markMessagesAsRead(selectedConnection, user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, selectedConnection]);

  // Add presence tracking
  useEffect(() => {
    if (!user) return;

    // Create a presence channel
    presenceChannel.current = supabase.channel('online-users', {
      config: {
        broadcast: { self: true },
        presence: {
          key: user.id,
        },
      },
    });

    // Subscribe to presence changes
    presenceChannel.current
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.current.presenceState();
        const onlineIds = Object.keys(presenceState);
        setOnlineUserIds(onlineIds);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach((presence: any) => {
          addOnlineUser(presence.key);
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          removeOnlineUser(presence.key);
        });
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.current.track({ user_id: user.id });
        }
      });

    return () => {
      if (presenceChannel.current) {
        supabase.removeChannel(presenceChannel.current);
      }
    };
  }, [user, setOnlineUserIds, addOnlineUser, removeOnlineUser]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-purple-50/30 to-blue-50/30 overflow-hidden">
      {/* Enhanced Connections Sidebar */}
      <div className="w-80 border-r border-border/50 glass-effect backdrop-blur-md">
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-purple-100/20">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{text.connectionsTitle}</h2>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{connections.length} connections</p>
            <div className="flex items-center space-x-1">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <FullConnections onlineUserIds={onlineUserIds} connections={connections} selectedConnection={selectedConnection} handleConnectionSelect={handleConnectionSelect} navigate={navigate} />
      </div>

      {/* Enhanced Chat Area */}
      <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-sm">
        {selectedConnection ? (
          <>
            {/* Enhanced Chat Header */}
            <ChatHeader selectedConnection={selectedConnection} />

            {/* Enhanced Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-background/50 to-white/80" style={{ scrollBehavior: 'smooth' }}>
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <Card className="text-center p-8 max-w-md mx-auto shadow-xl border-0 glass-effect backdrop-blur-md">
                    <div className="mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
                        <MessageCircle className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">No messages yet</h3>
                      <p className="text-muted-foreground">Start the conversation with {selectedConnection.name}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Send a message to begin your chat journey together
                    </div>
                  </Card>
                </div>
              ) : (
                <Messages messages={messages} messagesEndRef={messagesEndRef} isOtherTyping={isOtherTyping} selectedConnection={selectedConnection} />
              )}
            </div>

            {/* Enhanced Message Input */}
            <div className="p-6 border-t border-border/50 glass-effect backdrop-blur-md">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleSendMessage(e, messageText, setMessageText, selectedConnection, user);
                }}
                className="flex items-center gap-4 max-w-4xl mx-auto"
              >
                <div className="flex-1 relative">
                  <Input
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value)
                      handleTyping(typingChannel, user);
                    }}
                    placeholder={text.inputPlaceholder}
                    className="h-14 text-base rounded-xl border-2 border-border/30 bg-white/80 backdrop-blur-sm focus:bg-white focus:border-primary transition-all duration-200 pr-4 pl-6 shadow-sm"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="icon"
                  className="h-14 w-14 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-lg transition-all duration-200 hover:scale-105 glow-effect"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <NoConnection text={text.noConnectionSelected}/>
        )}
      </div>

      {/* Voice Help */}
      <VoiceHelpDiv text={text.voiceHelp} />
    </div>
  );
};

export default Chat;
