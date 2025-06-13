export interface Message {
  id: number;
  text: string;
  sender: "user" | "match";
  timestamp: Date;
  read: boolean;
  type: "text" | "image";
  imageUrl?: string;
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