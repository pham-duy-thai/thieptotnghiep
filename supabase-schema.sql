create table if not exists public.rsvps (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 60),
  attending boolean not null,
  guest_count integer not null default 0 check (guest_count between 0 and 10),
  created_at timestamptz not null default now()
);

create table if not exists public.wishes (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 60),
  message text not null check (char_length(message) between 1 and 140),
  created_at timestamptz not null default now()
);

create table if not exists public.heart_stats (
  id bigint generated always as identity primary key,
  name text,
  amount integer not null default 1 check (amount = 1),
  created_at timestamptz not null default now()
);

alter table public.heart_stats add column if not exists name text;

alter table public.rsvps enable row level security;
alter table public.wishes enable row level security;
alter table public.heart_stats enable row level security;

-- Keep tables private. Vercel API functions access them using the service role key.
revoke all on public.rsvps from anon, authenticated;
revoke all on public.wishes from anon, authenticated;
revoke all on public.heart_stats from anon, authenticated;
