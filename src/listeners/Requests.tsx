import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/authContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

          if (!payload.new || location.pathname.startsWith("/requests")) {
            console.log("[GlobalRequestListener] Ignored payload (empty or on /requests)");
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
          toast({
            title: "New Request",
            description: (
              <div className="flex items-center gap-2">
                {userData.photo ? (
                  <img
                    src={userData.photo}
                    alt={userData.name}
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white">
                    {userData.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <span>{userData.name} sent you a request.</span>
              </div>
            ),
            variant: "default",
            action: (
              <button
                onClick={() => {
                  console.log("Navigating to request ID:", payload.new.id);
                  navigate(`/requests/${payload.new.id}`);
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
