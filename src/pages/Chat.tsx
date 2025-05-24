import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, User } from "lucide-react";
import VoiceHelp from "@/components/VoiceHelp";
import { supabase } from "@/config/supabase";
import { User as SupabaseUser } from '@supabase/supabase-js';

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

// Initial mock messages for each connection
const initialMessages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      text: "Hello! I saw that we're both traveling to Toronto around the same time.",
      sender: "match",
      timestamp: new Date(Date.now() - 3600000),
    },
  ],
  2: [
    {
      id: 1,
      text: "Namaste! I noticed we're both traveling from Hyderabad to Toronto.",
      sender: "match",
      timestamp: new Date(Date.now() - 7200000),
    },
  ],
  3: [
    {
      id: 1,
      text: "Hi there! I'm also traveling to Toronto soon. Would be nice to have company!",
      sender: "match",
      timestamp: new Date(Date.now() - 10800000),
    },
  ],
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    console.log("matchid", matchId)
    if (matchId) {
      const connection = connections.find(c => c.id === matchId);
      if (connection) {
        setSelectedConnection(connection);

        const fetchMessages = async () => {
          const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("connection_id", matchId)
            .order("timestamp", { ascending: false });

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
    if (messageText.trim() === "" || !selectedConnection) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    

    console.log("selected", selectedConnection.user_id)
    await supabase.from("messages").insert({
      connection_id: selectedConnection.id,
      sender_id: user.id,
      receiver_id: selectedConnection.user_id,
      text: messageText,
      timestamp: new Date().toISOString()
    })

    setMessages([...messages, newMessage]);
    setMessageText("");
  };

  const handleConnectionSelect = (connection: Connection) => {
    navigate(`/chat/${connection.id}`);
    console.log(selectedConnection)
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Connections Sidebar */}
      <div className="w-80 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{text.connectionsTitle}</h2>
        </div>
        <div className="overflow-y-auto">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className={`p-4 border-b border-border cursor-pointer hover:bg-accent transition-colors ${
                selectedConnection?.id === connection.id ? "bg-accent" : ""
              }`}
              onClick={() => handleConnectionSelect(connection)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-muted">
                    {connection.photoUrl ? (
                      <img
                        src={connection.photoUrl}
                        alt={connection.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-primary/20 flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {connection.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{connection.name}</h3>
                  {connection.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {connection.lastMessage}
                    </p>
                  )}
                </div>
                {connection.lastMessageTime && (
                  <div className="text-xs text-muted-foreground">
                    {formatLastMessageTime(connection.lastMessageTime)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConnection ? (
          <>
            {/* Chat Header */}
            <header className="p-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                  {selectedConnection.photoUrl ? (
                    <img
                      src={selectedConnection.photoUrl}
                      alt={selectedConnection.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-primary/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold">{selectedConnection.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedConnection.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg">No messages yet</p>
                    <p className="text-sm">Start the conversation by sending a message below</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p>{message.text}</p>
                        <div
                          className={`text-xs mt-1 ${
                            message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
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

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={text.inputPlaceholder}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">{text.noConnectionSelected}</h3>
              <p className="text-muted-foreground">Choose a connection from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Voice Help */}
      <div className="absolute bottom-4 left-4">
        <VoiceHelp text={text.voiceHelp} />
      </div>
    </div>
  );
};

export default Chat;
