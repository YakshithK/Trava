import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Circle, MoreVertical, Flag, Blocks } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Connection } from "./types";
import { ReportBlockDialog } from "./ReportBlockDialog";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatHeaderProps {
  selectedConnection: Connection;
  user?: SupabaseUser | null;
}

export const ChatHeader = ({ selectedConnection, user }: ChatHeaderProps) => {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  return (
    <>
      <Card className="p-4 border-0 border-b border-border/50 rounded-none glass-effect backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                <AvatarImage src={selectedConnection.photoUrl || ""} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-100 text-xl font-semibold">
                  {selectedConnection.name[0]}
                </AvatarFallback>
              </Avatar>
              {selectedConnection.isOnline && (
                <Circle className="absolute -bottom-1 -right-1 h-4 w-4 fill-green-500 text-white border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{selectedConnection.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedConnection.isOnline ? "Online" : "Last seen recently"}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setShowReportDialog(true)}
                className="text-red-600 focus:text-red-700"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowBlockDialog(true)}
                className="text-red-600 focus:text-red-700"
              >
                <Blocks className="h-4 w-4 mr-2" />
                Block
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <ReportBlockDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        selectedConnection={selectedConnection}
        user={user}
        type="report"
      />

      <ReportBlockDialog
        isOpen={showBlockDialog}
        onClose={() => setShowBlockDialog(false)}
        selectedConnection={selectedConnection}
        user={user}
        type="block"
      />
    </>
  );
};
