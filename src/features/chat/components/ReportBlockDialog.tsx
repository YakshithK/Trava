
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Connection } from "../types";
import { reportUser, blockUser } from "../../../pages/chat/reportBlockFunctions";

interface ReportBlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedConnection: Connection;
  user: SupabaseUser | null;
  type: 'report' | 'block';
}

export const ReportBlockDialog = ({ 
  isOpen, 
  onClose, 
  selectedConnection, 
  user, 
  type 
}: ReportBlockDialogProps) => {
  const [showReportOption, setShowReportOption] = useState(false);
  const { toast } = useToast();

  const handleReport = async () => {
    const { error } = await reportUser(selectedConnection.user_id, user);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to report user. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Also block the user when reporting
    await blockUser(selectedConnection.user_id, user);
    
    toast({
      title: "User Reported",
      description: "User has been reported and blocked successfully.",
    });
    
    onClose();
  };

  const handleBlock = async () => {
    const { error } = await blockUser(selectedConnection.user_id, user);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "User Blocked",
      description: "You won't receive any more messages from this user.",
    });
    
    onClose();
  };

  const handleBlockWithReportOption = () => {
    setShowReportOption(true);
  };

  const handleReportToo = async () => {
    await reportUser(selectedConnection.user_id, user);
    await handleBlock();
  };

  if (type === 'report') {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to report {selectedConnection.name}? They'll be blocked too.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReport} className="bg-red-600 hover:bg-red-700">
              Report & Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block User</AlertDialogTitle>
          <AlertDialogDescription>
            {showReportOption 
              ? `Would you like to report ${selectedConnection.name} too?`
              : `You won't receive any more messages from ${selectedConnection.name}.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showReportOption ? (
            <>
              <AlertDialogCancel onClick={handleBlock}>No, just block</AlertDialogCancel>
              <AlertDialogAction onClick={handleReportToo} className="bg-red-600 hover:bg-red-700">
                Yes, report too
              </AlertDialogAction>
            </>
          ) : (
            <>
              <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleBlockWithReportOption} className="bg-red-600 hover:bg-red-700">
                Block
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
