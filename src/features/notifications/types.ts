export type NotificationType = 'match' | 'message' | 'trip' | 'system' | 'request';

export interface Notification {
  id: string;
  user_id: string;
  type_: NotificationType;
  title: string;
  message_: string;
  link_?: string;
  read_: boolean;
  icon: string;
  created_at: string;
} 