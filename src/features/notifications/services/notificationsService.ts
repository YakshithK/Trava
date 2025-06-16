import { supabase } from '@/config/supabase';
import { Notification } from '../types';

export const notificationsService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    console.log('Fetching notifications for user:', userId);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    console.log('Fetched notifications:', data);
    return data || [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    console.log('Marking notification as read:', notificationId);
    const { error } = await supabase
      .from('notifications')
      .update({ read_: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    console.log('Marking all notifications as read for user:', userId);
    const { error } = await supabase
      .from('notifications')
      .update({ read_: true })
      .eq('user_id', userId)
      .eq('read_', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    console.log('Creating new notification:', notification);
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    console.log('Created notification:', data);
    return data;
  },

  async deleteMessageNotifications(userId: string, chatId: string): Promise<void> {
    console.log('Deleting message notifications for chat:', chatId);
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('type_', 'message')
      .eq('link_', `/chat/${chatId}`);

    if (error) {
      console.error('Error deleting message notifications:', error);
      throw error;
    }

    // Fetch updated notifications to trigger state update
    const { data, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching updated notifications:', fetchError);
      throw fetchError;
    }
  },

  async deleteRequestNotifications(userId: string): Promise<void> {
    console.log('Deleting all request notifications for user:', userId);
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('type_', 'request');

    if (error) {
      console.error('Error deleting request notifications:', error);
      throw error;
    }

    // Fetch updated notifications to trigger state update
    const { data, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching updated notifications:', fetchError);
      throw fetchError;
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    console.log('Deleting notification:', notificationId);
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }

    // Fetch updated notifications to trigger state update
    const { data, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching updated notifications:', fetchError);
      throw fetchError;
    }
  },

  async markMessageNotificationsAsRead(userId: string, chatId: string): Promise<void> {
    console.log('Marking message notifications as read for chat:', chatId);
    const { error } = await supabase
      .from('notifications')
      .update({ read_: true })
      .eq('user_id', userId)
      .eq('type_', 'message')
      .eq('link_', `/chat/${chatId}`);

    if (error) {
      console.error('Error marking message notifications as read:', error);
      throw error;
    }

    // Fetch updated notifications to trigger state update
    const { data, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching updated notifications:', fetchError);
      throw fetchError;
    }
  },

  async markRequestNotificationsAsRead(userId: string): Promise<void> {
    console.log('Marking all request notifications as read for user:', userId);
    const { error } = await supabase
      .from('notifications')
      .update({ read_: true })
      .eq('user_id', userId)
      .eq('type_', 'request');

    if (error) {
      console.error('Error marking request notifications as read:', error);
      throw error;
    }

    // Fetch updated notifications to trigger state update
    const { data, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching updated notifications:', fetchError);
      throw fetchError;
    }
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    console.log('Marking notification as read:', notificationId);
    const { error } = await supabase
      .from('notifications')
      .update({ read_: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }

    // Fetch updated notifications to trigger state update
    const { data, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching updated notifications:', fetchError);
      throw fetchError;
    }
  }
}; 