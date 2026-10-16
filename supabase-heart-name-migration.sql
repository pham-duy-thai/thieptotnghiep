-- Run this once in Supabase SQL Editor so heart activity can show who sent it.
alter table public.heart_stats add column if not exists name text;
