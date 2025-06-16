import { Bell, X, Clock, User, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { notificationsService } from "../services/notificationsService";
import { Notification } from "../types";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface NotificationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationsChange: (notifications: Notification[]) => void;
}

const NotificationsSidebar = ({ 
  isOpen, 
  onClose, 
  notifications,
  onNotificationsChange 
}: NotificationsSidebarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  
  const unreadCount = notifications.filter(n => !n.read_).length;

  const markAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      onNotificationsChange(
        notifications.map(notification => 
          notification.id === id 
            ? { ...notification, read_: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationsService.markAllAsRead(user.id);
      onNotificationsChange(
        notifications.map(notification => ({ ...notification, read_: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark the notification as read
      await notificationsService.markNotificationAsRead(notification.id);
      
      // Then navigate if there's a link
      if (notification.link_) {
        navigate(notification.link_);
        onClose();
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation(); // Prevent triggering the notification click
    try {
      await notificationsService.deleteNotification(notificationId);
      // Update local state by removing the deleted notification
      onNotificationsChange(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'User':
        return User;
      case 'MessageSquare':
        return MessageSquare;
      case 'Calendar':
        return Calendar;
      default:
        return Bell;
    }
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
              <h2 className="text-lg font-semibold">{t('notifications.title')}</h2>
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
                {t('notifications.markAllRead')}
              </Button>
            </div>
          )}

          {/* Notifications List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">{t('notifications.noNotifications')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => {
                    const IconComponent = getIconComponent(notification.icon);
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50 relative group",
                          !notification.read_ 
                            ? "bg-primary/5 border-primary/20" 
                            : "bg-background border-border"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="flex gap-3">
                          <div className={cn(
                            "p-2 rounded-lg flex-shrink-0",
                            notification.type_ === "match" && "bg-green-100 text-green-600",
                            notification.type_ === "message" && "bg-blue-100 text-blue-600",
                            notification.type_ === "trip" && "bg-orange-100 text-orange-600",
                            notification.type_ === "system" && "bg-purple-100 text-purple-600",
                            notification.type_ === "request" && "bg-yellow-100 text-yellow-600"
                          )}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={cn(
                                "text-sm font-medium truncate",
                                !notification.read_ && "text-foreground"
                              )}>
                                {notification.title}
                              </h4>
                              {!notification.read_ && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message_}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(notification.created_at).toLocaleString()}
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
