import { formatTime } from "./functions";

export const Messages = ({messages, messagesEndRef, isOtherTyping, selectedConnection}) => (
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
        <div className="text-sm text-muted-foreground mt-2 animate-pulse pl-2">{`${selectedConnection?.name} is typing...`}</div>
        )}
    </div>
)