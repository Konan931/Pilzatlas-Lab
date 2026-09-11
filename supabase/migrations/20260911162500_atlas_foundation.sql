create schema if not exists extensions;
create extension if not exists postgis with schema extensions;
create table if not exists public.field_observations (id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,taxon_name text not null,observed_at timestamptz not null,exact_location extensions.geography(point,4326),public_h3 text,mission_mode text not null check (mission_mode in ('recon','harvest','photo')),notes text not null default '',payload jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create index if not exists field_observations_geo_idx on public.field_observations using gist (exact_location);
alter table public.field_observations enable row level security;
create policy "field observations: read own" on public.field_observations for select to authenticated using ((select auth.uid())=user_id);
create policy "field observations: insert own" on public.field_observations for insert to authenticated with check ((select auth.uid())=user_id);
create policy "field observations: update own" on public.field_observations for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "field observations: delete own" on public.field_observations for delete to authenticated using ((select auth.uid())=user_id);
