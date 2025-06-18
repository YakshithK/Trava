
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationsSidebar from "./NotificationsSidebar";
import { notificationsService } from "../services/notificationsService";
import { Notification } from "../types";
import { useAuth } from "@/context/authContext";
import { setupNotificationsListener } from "../services/notificationsListener";

const NotificationsTrigger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  
  const unreadCount = notifications.filter(n => !n.read_).length;

  useEffect(() => {
    if (!user?.id) return;

    // Initial load of notifications
    loadNotifications();

    // Set up real-time subscription
    const cleanup = setupNotificationsListener(user.id, (newNotifications) => {
      setNotifications(newNotifications);
    });

    return cleanup;
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    try {
      const data = await notificationsService.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Debug log for unread count
  useEffect(() => {
  }, [notifications, unreadCount]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative hover:bg-accent/50 transition-all duration-200 border border-border/20 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-semibold shadow-lg animate-pulse"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
        <span className="sr-only">Open notifications</span>
      </Button>

      <NotificationsSidebar 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        notifications={notifications}
        onNotificationsChange={setNotifications}
      />
    </>
  );
};

export default NotificationsTrigger;
