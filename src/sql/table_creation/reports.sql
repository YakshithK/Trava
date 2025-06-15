create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id),
  reported_id uuid references auth.users(id),
  reason text,
  created_at timestamp default now()
);
