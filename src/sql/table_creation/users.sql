create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  age int,
  contact_number text,
  email text unique,
  photo text, -- stores Base64 or image URL
  created_at timestamp with time zone default now(),
  code text
);
