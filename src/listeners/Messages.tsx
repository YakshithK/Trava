import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/authContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { notificationsService } from "@/features/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export function GlobalMessageListener() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (subscribed || !user) return;

    let channel: any;
    channel = supabase
      .channel(`messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        async (payload) => {
          if (!payload.new) return;
          const text = payload.new.text;
          const senderId = payload.new.sender_id;

          // Await the Supabase query
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("name, photo")
            .eq("id", senderId)
            .single();

          if (userError) {
            console.error("Error fetching user data:", userError);
            return;
          }

          // Create notification
          const notification = await notificationsService.createNotification({
            user_id: user.id,
            type_: 'message',
            title: 'New Message',
            message_: `${userData.name}: ${text}`,
            link_: `/chat/${payload.new.connection_id}`,
            read_: false,
            icon: 'MessageSquare'
          });

          // Only show toast if not on chat page
          if (location.pathname.startsWith('/chat')) return;

          toast({
            title: "New Message",
            description: (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData.photo} />
                  <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
                </Avatar>
                <span>{userData.name}: {text}</span>
              </div>
            ),
            variant: "default",
            action: (
              <button
                onClick={async () => {
                  // Delete the notification when toast is clicked
                  if (notification) {
                    await notificationsService.deleteNotification(notification.id);
                  }
                  window.location.href = `/chat/${payload.new.connection_id}`;
                }}
                className="underline text-primary"
              >
                Open
              </button>
            ),
          });
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user?.id, location.pathname, subscribed]);

  return null;
}