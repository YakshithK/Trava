export type Toast = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: string;
  action?: React.ReactNode;
  [key: string]: any;
};

export interface TravelMatch {
  user_id: string;
  trip_id: number;
  name: string;
  age: number;
  from_city: string;
  to_city: string;
  date: string;
  photo_url?: string;
}
