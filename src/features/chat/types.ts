export interface Message {
  id: string;
  text: string;
  sender: "user" | "match";
  timestamp: Date;
  read: boolean;
  type: "text" | "image";
  imageUrl?: string;
  edited?: boolean;
  reactions?: {
    emoji: string;
    userId: string;
  }[];
}

export interface Connection {
  id: string;
  user_id: string;
  name: string;
  photoUrl?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  isOnline?: boolean;
}