create table referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references users(id),
  referred_id uuid references users(id),
  created_at timestamp default now()
);
