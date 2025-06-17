-- Create packing lists table
create table if not exists public.packing_lists (
  id uuid primary key default uuid_generate_v4(),
  connection_id uuid references connections(id) on delete cascade,
  created_by uuid references auth.users(id),
  title text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create packing list items table
create table if not exists public.packing_list_items (
  id uuid primary key default uuid_generate_v4(),
  packing_list_id uuid references packing_lists(id) on delete cascade,
  item_name text not null,
  category text not null,
  is_checked boolean default false,
  assigned_to uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.packing_lists enable row level security;
alter table public.packing_list_items enable row level security;

-- Policies for packing_lists
create policy "Users can view their own packing lists"
  on public.packing_lists for select
  using (
    auth.uid() in (
      select user_id from connections 
      where id = connection_id
    )
  );

create policy "Users can create packing lists"
  on public.packing_lists for insert
  with check (
    auth.uid() in (
      select user_id from connections 
      where id = connection_id
    )
  );

-- Policies for packing_list_items
create policy "Users can view items in their lists"
  on public.packing_list_items for select
  using (
    auth.uid() in (
      select user_id from connections 
      where id = (
        select connection_id from packing_lists 
        where id = packing_list_id
      )
    )
  );

create policy "Users can modify items in their lists"
  on public.packing_list_items for all
  using (
    auth.uid() in (
      select user_id from connections 
      where id = (
        select connection_id from packing_lists 
        where id = packing_list_id
      )
    )
  );