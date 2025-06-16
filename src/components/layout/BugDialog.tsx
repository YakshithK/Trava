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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation('common');

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
        title: t('bugDialog.success.title'),
        description: t('bugDialog.success.description'),
      });
      setMessage("");
      onClose();
    } catch (error) {
      toast({
        title: t('bugDialog.error.title'),
        description: t('bugDialog.error.description'),
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
          <AlertDialogTitle>{t('bugDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('bugDialog.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded-lg p-2 text-base"
            placeholder={t('bugDialog.typePlaceholder')}
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            disabled={submitting}
          />
          <textarea
            className="w-full min-h-[100px] border rounded-lg p-2 text-base"
            placeholder={t('bugDialog.messagePlaceholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={submitting}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose} disabled={submitting}>
              {t('bugDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button type="submit" disabled={submitting || !message.trim()} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? t('bugDialog.submitting') : t('bugDialog.submit')}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};