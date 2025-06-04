import { Circle, Sparkle, User } from "lucide-react";
import { Connection } from "./types";

interface ChatHeaderProps {
  selectedConnection: Connection;
}

export const ChatHeader = ({ selectedConnection } : ChatHeaderProps) => (
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
            <Sparkle className="h-5 w-5 text-primary/60" />
            </div>
        </div>
    </header>
)