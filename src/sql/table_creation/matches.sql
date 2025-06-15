create table matches (
  id uuid primary key default gen_random_uuid(),
  from_user uuid references auth.users(id) on delete cascade,
  to_user uuid references auth.users(id) on delete cascade,
  trip_id uuid references trips(id) on delete cascade,
  status text default 'pending', -- optional: can be 'pending', 'accepted', 'declined'
  created_at timestamp with time zone default timezone('utc'::text, now())
);
