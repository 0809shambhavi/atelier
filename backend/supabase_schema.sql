-- Run this in your Supabase SQL editor (supabase.com → your project → SQL Editor)

-- Sessions table
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  title text default 'New conversation'
);

-- Messages table (conversation history)
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  role text not null,
  content text not null
);

-- Saved items (moodboards + looks)
create table if not exists saved_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  title text default '',
  data jsonb not null
);

-- Shares (public shareable moodboards)
create table if not exists shares (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  share_id text unique not null,
  type text not null,
  data jsonb not null
);

-- Feedback
create table if not exists feedback (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_id uuid,
  session_id text,
  rating integer,
  response_type text,
  message_text text,
  comment text
);

-- Wardrobe items
create table if not exists wardrobe (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  item text not null,
  category text,
  color text,
  notes text
);

-- Enable Row Level Security
alter table sessions    enable row level security;
alter table messages    enable row level security;
alter table saved_items enable row level security;
alter table wardrobe    enable row level security;

-- RLS policies (users can only see their own data)
create policy "own sessions"    on sessions    for all using (auth.uid() = user_id);
create policy "own messages"    on messages    for all using (auth.uid() = user_id);
create policy "own saves"       on saved_items for all using (auth.uid() = user_id);
create policy "own wardrobe"    on wardrobe    for all using (auth.uid() = user_id);
create policy "shares public"   on shares      for select using (true);
create policy "shares insert"   on shares      for insert with check (true);
create policy "feedback insert" on feedback    for insert with check (true);
