import { formatTime } from "./functions";
import { Connection, Message } from "./types";

interface MessageProps {
  messages: Message[];
    messagesEndRef: React.RefObject<HTMLDivElement>;
    isOtherTyping: boolean;
    selectedConnection: Connection | null;
}

export const Messages = ({messages, messagesEndRef, isOtherTyping, selectedConnection}: MessageProps) => (
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
            {message.type === "image" && message.imageUrl ? (
                <div className="mb-2">
                <img
                    src={message.imageUrl}
                    alt="Shared image"
                    className="max-w-full rounded-lg"
                    loading="lazy"
                />
                </div>
            ) : null}
            <div className="flex items-center gap-2">
                <p className={`text-base leading-relaxed ${message.sender === "user" ? "!text-white" : "text-gray-600"}`}>{message.text}</p>
                {message.sender === "user" && (
                <span className={`ml-2 text-xs font-semibold ${message.read ? "text-green-600" : "text-gray-400"}`}>
                    {message.read ? "Read" : "Unread"}
                </span>
                )}
            </div>
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
        {isOtherTyping && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2 pl-2">
            <span>{selectedConnection?.name}</span>
            <span>is typing...</span>
            <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms'}}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms'}}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms'}}></div>
            </div>
        </div>
        )}
    </div>
)