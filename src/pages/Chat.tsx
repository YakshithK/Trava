import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, User, Circle, MessageCircle, Sparkles } from "lucide-react";
import VoiceHelp from "@/components/VoiceHelp";
import { supabase } from "@/config/supabase";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  text: string;
  sender: "user" | "match";
  timestamp: Date;
}

interface Connection {
  id: string;
  user_id: string;
  name: string;
  photoUrl?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  isOnline?: boolean;
}

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
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const text = chatTexts.en;
  const { toast } = useToast();

  useEffect(() => {
    const fetchConnections = async () => {

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

    fetchConnections();
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

        const fetchMessages = async () => {
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
                timestamp: new Date(msg.timestamp),
              }))
            );
          }
        };
        fetchMessages()
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
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `connection_id=eq.${selectedConnection.id}`
        },
        (payload) => {
          if (!payload.new) return;
          const newMessage: Message = {
            id: payload.new.id,
            text: payload.new.text,
            sender: payload.new.sender_id === user.id ? "user" : "match",
            timestamp: new Date(payload.new.timestamp),
          };
          setMessages(prev => {
            // Only add if this message ID doesn't already exist
            if (prev.some(msg => msg.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [selectedConnection?.id, user?.id]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() === "" || !selectedConnection || !user) return;

    const messageToSend = messageText.trim();
    const tempId = Date.now(); // Temporary ID for optimistic update
    
    // Clear textbox immediately
    setMessageText("");

    // Add message optimistically to UI with animation
    const optimisticMessage: Message = {
      id: tempId,
      text: messageToSend,
      sender: "user" as const,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, optimisticMessage]);

    // Try to send to Supabase in background
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
        // but keep it in the UI since it's already shown
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Message stays in UI regardless of database success/failure
    }
  };

  const handleConnectionSelect = (connection: Connection) => {
    navigate(`/chat/${connection.id}`);
    console.log(selectedConnection)
  };

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
        <div className="overflow-y-auto h-full">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className={`p-4 border-b border-border/30 cursor-pointer hover:bg-accent/30 transition-all duration-300 ${
                selectedConnection?.id === connection.id 
                  ? "bg-primary/10 border-l-4 border-l-primary shadow-sm" 
                  : "hover:shadow-sm"
              }`}
              onClick={() => handleConnectionSelect(connection)}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-purple-100 ring-2 ring-white shadow-md">
                    {connection.photoUrl ? (
                      <img
                        src={connection.photoUrl}
                        alt={connection.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/30 to-purple-200 flex items-center justify-center">
                        <User className="h-7 w-7 text-primary/70" />
                      </div>
                    )}
                  </div>
                  {connection.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white shadow-sm">
                      <Circle className="h-2 w-2 fill-current text-green-500 mx-auto mt-0.5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate text-lg">{connection.name}</h3>
                  {connection.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {connection.lastMessage}
                    </p>
                  )}
                  <div className="flex items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      connection.isOnline 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}>
                      {connection.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
                {connection.lastMessageTime && (
                  <div className="text-xs text-muted-foreground font-medium">
                    {formatLastMessageTime(connection.lastMessageTime)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Chat Area */}
      <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-sm">
        {selectedConnection ? (
          <>
            {/* Enhanced Chat Header */}
            <header className="p-6 border-b border-border/50 glass-effect backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-purple-100 ring-2 ring-white shadow-md">
                    {selectedConnection.photoUrl ? (
                      <img
                        src={selectedConnection.photoUrl}
                        alt={selectedConnection.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/30 to-purple-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary/70" />
                      </div>
                    )}
                  </div>
                  {selectedConnection.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-xl text-foreground">{selectedConnection.name}</h2>
                  <p className={`text-sm font-medium flex items-center ${
                    selectedConnection.isOnline ? "text-green-600" : "text-muted-foreground"
                  }`}>
                    <Circle className={`h-2 w-2 mr-2 ${
                      selectedConnection.isOnline ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"
                    }`} />
                    {selectedConnection.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
                <div className="ml-auto">
                  <Sparkles className="h-5 w-5 text-primary/60" />
                </div>
              </div>
            </header>

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
                <div className="space-y-6 max-w-4xl mx-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex animate-fade-in-up ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-6 py-4 rounded-2xl shadow-md backdrop-blur-sm transition-all duration-200 hover:shadow-lg ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-primary to-purple-600 !text-white rounded-br-lg glow-effect"
                            : "bg-white/90 border border-border/30 text-gray-600 rounded-bl-lg"
                        }`}
                      >
                        <p className={`text-base leading-relaxed ${message.sender === "user" ? "!text-white" : "text-gray-600"}`}>{message.text}</p>
                        <div
                          className={`text-xs mt-3 font-medium ${
                            message.sender === "user" 
                              ? "!text-white/80" 
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Enhanced Message Input */}
            <div className="p-6 border-t border-border/50 glass-effect backdrop-blur-md">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
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
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background/50 to-white/80">
            <Card className="text-center p-12 max-w-lg mx-auto shadow-xl border-0 glass-effect backdrop-blur-md">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{text.noConnectionSelected}</h3>
                <p className="text-muted-foreground text-lg">Choose a connection from the sidebar to start messaging</p>
              </div>
              <div className="text-sm text-muted-foreground">
                Your conversations will appear here once you select a connection
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Voice Help */}
      <div className="absolute bottom-6 left-6">
        <VoiceHelp text={text.voiceHelp} />
      </div>
    </div>
  );
};

export default Chat;
