import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/authContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

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
          // Only show toast if not on chat page
          if (location.pathname.startsWith('/chat')) return;
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

          toast({
            title: "New Message",
            description: (
              <div className="flex items-center gap-2">
                <img
                  src={userData.photo}
                  alt={userData.name}
                  className="w-8 h-8 rounded-full object-cover border"
                  style={{ display: userData.photo ? "block" : "none" }}
                />
                <span>{userData.name}: {text}</span>
              </div>
            ),
            variant: "default",
            action: (
              <button
                onClick={() => {
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
  }, [user, location.pathname]);
  return null;
}