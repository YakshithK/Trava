create table message_reactions (
    id uuid default uuid_generate_v4() primary key,
    message_id uuid references messages(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    emoji text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(message_id, user_id, emoji)
)