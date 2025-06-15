create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  type text, -- 'bug', 'suggestion', etc.
  message text,
  created_at timestamp default now()
);
