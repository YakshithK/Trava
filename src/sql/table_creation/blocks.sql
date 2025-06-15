create table blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid references auth.users(id),
  blocked_id uuid references auth.users(id),
  created_at timestamp default now(),
  unique (blocker_id, blocked_id)
);
