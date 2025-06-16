import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/authContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { notificationsService } from "@/features/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export function GlobalRequestListener() {
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) {
      console.log("[GlobalRequestListener] Skipped — no user");
      return;
    }

    console.log("[GlobalRequestListener] Subscribing for user:", user.id);

    const channel = supabase
      .channel("requests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `to_user=eq.${user.id}`,
        },
        async (payload) => {
          console.log("[GlobalRequestListener] New match payload:", payload);

          if (!payload.new) {
            console.log("[GlobalRequestListener] Ignored payload (empty)");
            return;
          }

          const senderId = payload.new.from_user;
          const { data: userData, error } = await supabase
            .from("users")
            .select("name, photo")
            .eq("id", senderId)
            .single();

          if (error) {
            console.error("Error fetching sender:", error);
            return;
          }
          console.log("[GlobalRequestListener] Fetched user data:", userData);

          // Create notification
          const notification = await notificationsService.createNotification({
            user_id: user.id,
            type_: 'request',
            title: 'New Travel Request',
            message_: `${userData.name} sent you a travel request`,
            link_: `/requests`,
            read_: false,
            icon: 'User'
          });

          // Only show toast if not on requests page
          if (location.pathname.startsWith("/requests")) {
            console.log("[GlobalRequestListener] Ignored toast (on /requests)");
            return;
          }

          toast({
            title: "New Request",
            description: (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData.photo} />
                  <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
                </Avatar>
                <span>{userData.name} sent you a request.</span>
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
                  console.log("Navigating to request ID:", payload.new.id);
                  navigate(`/requests`);
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
      console.log("[GlobalRequestListener] Cleaning up channel");
      supabase.removeChannel(channel);
    };
  }, [user?.id, location.pathname]);

  return null;
}
