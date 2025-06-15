create extension if not exists "pgcrypto";

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  "from" text not null,
  "to" text not null,
  date date not null,
  airline text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc', now())
);