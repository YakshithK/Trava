import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, User, Circle } from "lucide-react";
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
    <div className="flex h-screen bg-gradient-to-br from-saath-cream to-white">
      {/* Enhanced Connections Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-saath-saffron/10 to-saath-green/10">
          <h2 className="text-xl font-bold text-gray-800">{text.connectionsTitle}</h2>
          <p className="text-sm text-gray-600 mt-1">{connections.length} connections</p>
        </div>
        <div className="overflow-y-auto h-full">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gradient-to-r hover:from-saath-green/5 hover:to-saath-saffron/5 transition-all duration-200 ${
                selectedConnection?.id === connection.id 
                  ? "bg-gradient-to-r from-saath-green/10 to-saath-saffron/10 border-l-4 border-l-saath-green" 
                  : ""
              }`}
              onClick={() => handleConnectionSelect(connection)}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-gradient-to-br from-saath-green/20 to-saath-saffron/20 ring-2 ring-white shadow-md">
                    {connection.photoUrl ? (
                      <img
                        src={connection.photoUrl}
                        alt={connection.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-saath-green/30 to-saath-saffron/30 flex items-center justify-center">
                        <User className="h-7 w-7 text-gray-600" />
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
                  <h3 className="font-semibold text-gray-800 truncate text-lg">{connection.name}</h3>
                  {connection.lastMessage && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {connection.lastMessage}
                    </p>
                  )}
                  <div className="flex items-center mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      connection.isOnline 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {connection.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
                {connection.lastMessageTime && (
                  <div className="text-xs text-gray-400 font-medium">
                    {formatLastMessageTime(connection.lastMessageTime)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConnection ? (
          <>
            {/* Enhanced Chat Header */}
            <header className="p-6 border-b border-gray-200 bg-gradient-to-r from-white to-saath-cream/30 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-saath-green/20 to-saath-saffron/20 ring-2 ring-white shadow-md">
                    {selectedConnection.photoUrl ? (
                      <img
                        src={selectedConnection.photoUrl}
                        alt={selectedConnection.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-saath-green/30 to-saath-saffron/30 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                  </div>
                  {selectedConnection.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-xl text-gray-800">{selectedConnection.name}</h2>
                  <p className={`text-sm font-medium ${
                    selectedConnection.isOnline ? "text-green-600" : "text-gray-500"
                  }`}>
                    {selectedConnection.isOnline ? "🟢 Online" : "⚫ Offline"}
                  </p>
                </div>
              </div>
            </header>

            {/* Enhanced Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <Card className="text-center p-8 max-w-md mx-auto shadow-lg border-0 bg-gradient-to-br from-saath-cream to-white">
                    <div className="mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-saath-green/20 to-saath-saffron/20 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No messages yet</h3>
                      <p className="text-gray-600">Start the conversation with {selectedConnection.name}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Send a message to begin your chat journey together
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-6 py-4 rounded-3xl shadow-md ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-saath-green to-saath-green/90 text-white rounded-br-lg"
                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-lg"
                        }`}
                      >
                        <p className="text-base leading-relaxed">{message.text}</p>
                        <div
                          className={`text-xs mt-3 font-medium ${
                            message.sender === "user" 
                              ? "text-white/80" 
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
            <div className="p-6 border-t border-gray-200 bg-white shadow-lg">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={text.inputPlaceholder}
                    className="h-14 text-base rounded-2xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-saath-green transition-all duration-200 pr-4 pl-6"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="icon"
                  className="h-14 w-14 rounded-2xl bg-gradient-to-r from-saath-green to-saath-green/90 hover:from-saath-green/90 hover:to-saath-green shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
            <Card className="text-center p-12 max-w-lg mx-auto shadow-xl border-0 bg-gradient-to-br from-saath-cream to-white">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-saath-green/20 to-saath-saffron/20 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{text.noConnectionSelected}</h3>
                <p className="text-gray-600 text-lg">Choose a connection from the sidebar to start messaging</p>
              </div>
              <div className="text-sm text-gray-500">
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
