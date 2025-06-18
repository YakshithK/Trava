import { supabase } from '@/config/supabase';
import { notificationsService } from './notificationsService';
import { NotificationType } from '../types';

export const setupNotificationsListener = (userId: string, onNotificationChange: (notifications: any[]) => void) => {

  // Listen for notifications changes
  const notificationsSubscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        // When any change occurs, fetch the latest notifications
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        onNotificationChange(data || []);
      }
    )
    .subscribe();

  // Listen for new messages
  const messagesSubscription = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`,
      },
      async (payload) => {
        const message = payload.new;
        await notificationsService.createNotification({
          user_id: userId,
          type_: 'message',
          title: 'New Message',
          message_: `You have a new message from ${message.sender_name || 'someone'}`,
          link_: `/chat/${message.chat_id}`,
          read_: false,
          icon: 'MessageSquare',
        });
      }
    )
    .subscribe();

  // Listen for new requests
  const requestsSubscription = supabase
    .channel('requests')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'requests',
        filter: `recipient_id=eq.${userId}`,
      },
      async (payload) => {
        const request = payload.new;
        await notificationsService.createNotification({
          user_id: userId,
          type_: 'request',
          title: 'New Travel Request',
          message_: `You have a new travel request from ${request.sender_name || 'someone'}`,
          link_: `/requests/${request.id}`,
          read_: false,
          icon: 'User',
        });
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    notificationsSubscription.unsubscribe();
    messagesSubscription.unsubscribe();
    requestsSubscription.unsubscribe();
  };
}; 