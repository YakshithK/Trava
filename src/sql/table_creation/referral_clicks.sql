create table referral_clicks (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references users(id),
  created_at timestamp default now()
);
