import { Input } from "@/components/ui/input";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "match";
  timestamp: Date;
  read: boolean;
  imageUrl?: string;
  edited?: boolean;
  reactions?: {
    emoji: string;
    userId: string;
  }[];
  type: "text" | "image" | "packing_list";
  packingListId?: string;
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

