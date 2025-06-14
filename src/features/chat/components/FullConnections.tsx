import { Circle, User } from "lucide-react";
import { formatLastMessageTime } from "../utils/formatLastMessage";
import { Connection } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FullConnectionsProps {
  onlineUserIds, 
  connections: Connection[];
  selectedConnection: Connection | null;
  handleConnectionSelect: (
    connection: Connection,
    selectedConnection: Connection | null,
    navigate: any
  ) => void;
  navigate: any;
}

export const FullConnections = ({onlineUserIds, connections, selectedConnection, handleConnectionSelect, navigate}: FullConnectionsProps) => (
    <div className="overflow-y-auto h-full">
        {connections.map((connection) => (
        <div
            key={connection.id}
            className={`p-4 border-b border-border/30 cursor-pointer hover:bg-accent/30 transition-all duration-300 ${
            selectedConnection?.id === connection.id 
                ? "bg-primary/10 border-l-4 border-l-primary shadow-sm" 
                : "hover:shadow-sm"
            }`}
            onClick={() => handleConnectionSelect(connection, selectedConnection, navigate)}
        >
            <div className="flex items-center gap-4">
            <div className="relative">
                <Avatar className="h-14 w-14 ring-2 ring-white shadow-md">
                    <AvatarImage src={connection.photoUrl || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-purple-200">
                        <User className="h-7 w-7 text-primary/70" />
                    </AvatarFallback>
                </Avatar>
                {onlineUserIds.includes(connection.user_id) && (
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
                    onlineUserIds.includes(connection.user_id)
                    ? "bg-green-100 text-green-700 border border-green-200" 
                    : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}>
                    {onlineUserIds.includes(connection.user_id) ? "Online" : "Offline"}
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
)
