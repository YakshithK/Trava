
import { useState } from "react";
import { Bell, X, Clock, User, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NotificationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock notification data for UI purposes
const mockNotifications = [
  {
    id: 1,
    type: "match",
    title: "New Match Found!",
    message: "You have a new travel match for your NYC trip",
    time: "2 min ago",
    unread: true,
    icon: User,
  },
  {
    id: 2,
    type: "message",
    title: "New Message",
    message: "Sarah sent you a message about the flight details",
    time: "15 min ago",
    unread: true,
    icon: MessageSquare,
  },
  {
    id: 3,
    type: "trip",
    title: "Trip Reminder",
    message: "Your flight to London is tomorrow at 8:30 AM",
    time: "1 hour ago",
    unread: false,
    icon: Calendar,
  },
  {
    id: 4,
    type: "system",
    title: "Profile Updated",
    message: "Your travel preferences have been saved",
    time: "3 hours ago",
    unread: false,
    icon: User,
  },
];

const NotificationsSidebar = ({ isOpen, onClose }: NotificationsSidebarProps) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-80 bg-background border-l border-border shadow-lg transform transition-transform duration-300 ease-in-out z-50",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <div className="p-4 border-b border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="w-full"
              >
                Mark all as read
              </Button>
            </div>
          )}

          {/* Notifications List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => {
                    const IconComponent = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50",
                          notification.unread 
                            ? "bg-primary/5 border-primary/20" 
                            : "bg-background border-border"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          <div className={cn(
                            "p-2 rounded-lg flex-shrink-0",
                            notification.type === "match" && "bg-green-100 text-green-600",
                            notification.type === "message" && "bg-blue-100 text-blue-600",
                            notification.type === "trip" && "bg-orange-100 text-orange-600",
                            notification.type === "system" && "bg-purple-100 text-purple-600"
                          )}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={cn(
                                "text-sm font-medium truncate",
                                notification.unread && "text-foreground"
                              )}>
                                {notification.title}
                              </h4>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {notification.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default NotificationsSidebar;
