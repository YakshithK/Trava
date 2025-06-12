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
import { supabase } from "@/config/supabase";


interface BugDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: SupabaseUser
}

export const BugDialog = ({ isOpen, onClose, user}: BugDialogProps) => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("")
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const {data, error} = await supabase
        .from("feedback")
        .insert({
        user_id: user.id,
        type,
        message,
        created_at: new Date().toISOString()
        });
      toast({
        title: "Bug Reported",
        description: "Thank you for your feedback! We'll look into it.",
      });
      setMessage("");
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit bug report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Report a Bug</AlertDialogTitle>
          <AlertDialogDescription>
            Please describe the issue you encountered. Our team will review your report as soon as possible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded-lg p-2 text-base"
            placeholder="What type of bug is it?"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            disabled={submitting}
          />
          <textarea
            className="w-full min-h-[100px] border rounded-lg p-2 text-base"
            placeholder="Describe the bug or issue..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={submitting}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose} disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button type="submit" disabled={submitting || !message.trim()} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? "Submitting..." : "Submit Bug"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};