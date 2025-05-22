import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send } from "lucide-react";
import VoiceHelp from "@/components/VoiceHelp";

interface Message {
  id: number;
  text: string;
  sender: "user" | "match";
  timestamp: Date;
}

const chatTexts = {
  en: {
    title: "Chat with",
    inputPlaceholder: "Type your message here...",
    sendButton: "Send",
    voiceHelp: "This is your chat with a travel companion. Type your message in the text box at the bottom and press the send button to send it. You'll see your messages on the right side and your companion's messages on the left.",
  },
};

// Mock data for the chat
const mockMatchInfo: Record<number, { name: string; photoUrl: string | undefined }> = {
  1: {
    name: "Ramesh Patel",
    photoUrl: "https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
  },
  2: {
    name: "Lakshmi Reddy",
    photoUrl: "https://images.unsplash.com/photo-1551863863-e01bbf274ef6?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
  },
  3: {
    name: "Prabhu Sharma",
    photoUrl: undefined,
  },
};

// Initial mock messages
const initialMessages: Record<string, Message[]> = {
  "1": [
    {
      id: 1,
      text: "Hello! I saw that we're both traveling to Toronto around the same time.",
      sender: "match",
      timestamp: new Date(Date.now() - 3600000),
    },
  ],
  "2": [
    {
      id: 1,
      text: "Namaste! I noticed we're both traveling from Hyderabad to Toronto.",
      sender: "match",
      timestamp: new Date(Date.now() - 7200000),
    },
  ],
  "3": [
    {
      id: 1,
      text: "Hi there! I'm also traveling to Toronto soon. Would be nice to have company!",
      sender: "match",
      timestamp: new Date(Date.now() - 10800000),
    },
  ],
};

const Chat = () => {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const text = chatTexts.en;

  // Fixed: Convert matchId string to number for type safety when accessing mockMatchInfo
  const numericMatchId = matchId ? parseInt(matchId) : null;
  const matchInfo = numericMatchId && mockMatchInfo[numericMatchId]
    ? mockMatchInfo[numericMatchId]
    : { name: "Unknown", photoUrl: undefined };

  useEffect(() => {
    // Load messages for the current match
    if (matchId && initialMessages[matchId]) {
      setMessages(initialMessages[matchId]);
    }
  }, [matchId]);

  useEffect(() => {
    // Scroll to the bottom of the messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() === "") return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessageText("");

    // Simulate a response after a short delay
    setTimeout(() => {
      const responseMessage: Message = {
        id: messages.length + 2,
        text: `Thank you for your message. I'm looking forward to traveling together!`,
        sender: "match",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, responseMessage]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-saath-cream flex flex-col">
      <header className="p-4 flex justify-between items-center border-b border-saath-light-gray bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-saath-gray"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-saath-light-gray">
              {matchInfo.photoUrl ? (
                <img
                  src={matchInfo.photoUrl}
                  alt={matchInfo.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-saath-saffron flex items-center justify-center text-white font-bold">
                  {matchInfo.name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold">
              {text.title} {matchInfo.name}
            </h2>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6 mb-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-5 py-4 rounded-2xl text-lg ${
                    message.sender === "user"
                      ? "bg-saath-saffron text-black rounded-tr-none"
                      : "bg-white text-saath-gray rounded-tl-none shadow-md"
                  }`}
                >
                  <p>{message.text}</p>
                  <div
                    className={`text-sm mt-2 ${
                      message.sender === "user" ? "text-black/70" : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <div className="p-4 bg-white border-t border-saath-light-gray">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={text.inputPlaceholder}
              className="flex-1 h-14 text-lg rounded-full border-2 border-saath-light-gray"
            />
            <Button
              type="submit"
              className="h-14 rounded-full bg-saath-green hover:bg-saath-green/90 text-black"
            >
              <Send className="h-5 w-5 mr-2" />
              {text.sendButton}
            </Button>
          </form>
        </div>
      </div>

      <div className="p-4 flex justify-center">
        <VoiceHelp text={text.voiceHelp} />
      </div>
    </div>
  );
};

export default Chat;
