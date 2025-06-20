import { useState } from "react";
import { editMessage } from "../controllers/editMessage";
import { formatTime } from "../utils/formatTime";
import { Connection, Message } from "../types";
import { Button } from "@/components/ui/button";
import { Check, Edit, Smile, Trash, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { deleteMessage } from "../controllers/deleteMessage";
import { handleReaction } from "../controllers/handleReaction";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PackingList } from "@/features/packing_list";

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "👏", "🔥"];

interface MessageProps {
  messages: Message[];
    messagesEndRef: React.RefObject<HTMLDivElement>;
    isOtherTyping: boolean;
    selectedConnection: Connection | null;
    user: any,
    toast: any
}   
export const Messages = ({messages, messagesEndRef, isOtherTyping, selectedConnection, user, toast}: MessageProps) => {
 
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
    const [editText, setEditText] = useState("")

    const handleEdit = (message: Message) => {
        setEditingMessageId(message.id)
        setEditText(message.text)
    }

    const handleSaveEdit = async (message: Message) => {
        if (editText.trim() === message.text) {
            setEditingMessageId(null)
            return
        }
        await editMessage(message, editText.trim(), user, toast)
        setEditingMessageId(null)
    }

    const handleCancelEdit = () => {
        setEditingMessageId(null)
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex animate-fade-in-up group ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-6 py-4 rounded-2xl shadow-md backdrop-blur-sm transition-all duration-200 hover:shadow-lg relative ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-primary to-purple-600 !text-white rounded-br-lg glow-effect"
                    : "bg-white/90 border border-border/30 text-gray-600 rounded-bl-lg"
                }`}
              >

                {message.type === "packing_list" && message.packingListId && (
                  <div className="mt-2">
                    <PackingList connectionId={selectedConnection.id} />
                  </div>
                )}

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
                
                {editingMessageId === message.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white hover:text-green-400 hover:bg-white/10"
                      onClick={() => handleSaveEdit(message)}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white hover:text-red-400 hover:bg-white/10"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <p className={`text-base leading-relaxed ${message.sender === "user" ? "!text-white" : "text-gray-600"}`}>
                        {message.text}
                        {message.edited && (
                          <span className="text-xs ml-2 opacity-70">(edited)</span>
                        )}
                      </p>
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
                  </>
                )}
                
                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(
                      message.reactions.reduce((acc, reaction) => {
                        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([emoji, count]) => (
                      <div
                        key={emoji}
                        className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-sm"
                        onClick={() => handleReaction(message.id, emoji, user)}
                      >
                        <span>{emoji}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Enhanced Reaction Button - more visible */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg border-2 transition-all duration-200 hover:scale-110 ${
                        message.sender === "user" 
                          ? "bg-white text-primary border-white hover:bg-gray-50" 
                          : "bg-primary text-white border-primary hover:bg-primary/90"
                      }`}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <div className="flex gap-2">
                      {COMMON_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          className="hover:scale-125 transition-transform text-lg p-1 rounded hover:bg-gray-100"
                          onClick={() => handleReaction(message.id, emoji, user)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Enhanced Action buttons - only show for user messages */}
                {message.sender === "user" && editingMessageId !== message.id && (
                  <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out transform translate-y-1 group-hover:translate-y-0">
                    <div className="flex bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 p-1 gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors duration-150"
                        onClick={() => handleEdit(message)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                        onClick={() => deleteMessage(message, user, toast)}
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
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
      );
    };
